import { CardWrapper } from "@/components/card-wrapper";
import { TopicAttitudeChart } from "@/components/charts/topic-attitiude";
import { EmptyState } from "@/components/empty-state";
import { VotingList } from "@/components/voting-list";
import { getClubAndIdsByNames } from "@/lib/neo4j/person";
import { getVotingResultsByNumbrs } from "@/lib/neo4j/voting";
import { getPointDetails } from "@/lib/queries/pointDetails";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/components/default-layout";
import CommentSection from "./components/comment-section";

export async function generateMetadata({}: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  return {
    title: `Punkt obrad | Sejmofil`,
    description: `Analiza punktu obrad w Sejmie.`,
  };
}

const comments = [
  {
    id: "1",
    author: "Marcin Józefaciuk",
    content:
      "Poseł Marcin Józefaciuk uczcił pamięć Dawida Nowaka, ratownika medycznego i działacza charytatywnego, który po śmierci podarował swoje organy, dając szansę na życie sześciu osobom. Poseł podkreślił jego zaangażowanie w pomoc innym i poświęcenie. Dawid był jednym z tych ludzi, którzy nie tylko mówią o pomocy, lecz także przede wszystkim działają.",
    timestamp: "30sek temu",
    likes: 6,
    dislikes: 21,
    replies: [
      {
        id: "2",
        author: "Gracek Platon",
        content: "Zabij się pod człowieku Edit(Ratio)",
        timestamp: "21min temu",
        likes: 6,
        dislikes: 21,
      },
    ],
  },
];

export default async function PointDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: number; number: string; date: string }>;
  searchParams?: Promise<{ showAll?: string }>;
}) {
  const { id, number, date } = await params;
  if (!id) notFound();

  const showAll = (await searchParams)?.showAll === "true";
  const point = await getPointDetails(id, showAll);
  const speakerNames = [
    ...new Set(point.statements.map((s) => s.speaker_name)),
  ];
  const speakerClubs = await getClubAndIdsByNames(speakerNames);

  // Group statements by speaker to avoid repeated lookups
  const statementsBySpeaker = new Map<string, typeof point.statements>();
  point.statements.forEach((st) => {
    if (!statementsBySpeaker.has(st.speaker_name)) {
      statementsBySpeaker.set(st.speaker_name, []);
    }
    statementsBySpeaker.get(st.speaker_name)?.push(st);
  });

  // Only process valid clubs
  const clubAttitudes = speakerClubs
    .filter((clubInfo) => clubInfo.club !== null) // skip if club is null
    .reduce((acc, { name, club }) => {
      if (!acc[club]) {
        acc[club] = { total: 0, count: 0 };
      }
      const speakerStatements = statementsBySpeaker.get(name) || [];
      speakerStatements.forEach((s) => {
        if (
          s.statement_ai?.topic_attitude?.score &&
          s.statement_ai?.topic_attitude?.score !== 0
        ) {
          acc[club].total += s.statement_ai.topic_attitude.score;
          acc[club].count += 1;
        }
      });
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

  // Prepare data for topic attitude chart
  const chartData = Object.entries(clubAttitudes).map(([club, data]) => ({
    club,
    attitude: data.total / data.count - 3,
    count: data.count,
  }));

  console.log("🚀 ~ point:", point);
  const simpleVotingResults =
    point.voting_numbers?.length > 0
      ? await getVotingResultsByNumbrs(
          point.proceeding_day.proceeding.number,
          point.voting_numbers
        )
      : [];
  return (
    <PageLayout
      filterBar={null}
      sidebar={<div className="space-y-4 py-24 bg-amber-100" />}
      content={
        <>
          <CardWrapper
            title="Analiza AI"
            className="h-full"
            subtitle="Stosunek do tematu"
            tabs={[
              {
                value: "statystyki",
                label: "Statystyki",
                content:
                  chartData.length >= 7 ? (
                    <TopicAttitudeChart data={chartData} />
                  ) : (
                    <EmptyState
                      text="Za mało danych do wyświetlenia analizy klubów"
                      image="/empty.svg"
                    />
                  ),
              },
              {
                value: "stanowiska",
                label: "Stanowiska",
                content: (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {point.summary_main.key_positions}
                    </ReactMarkdown>
                  </div>
                ),
              },
              {
                value: "kwestie-sporne",
                label: "Kwestie Sporne",
                content: (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {point.summary_main.unresolved}
                    </ReactMarkdown>
                  </div>
                ),
              },
            ]}
            defaultTab="statystyki"
          />
          {/* Voting section */}
          <div className="col-span-full lg:col-span-6">
            <CardWrapper
              title="Głosowania"
              className="h-full"
              subtitle="Wyniki głosowań"
            >
              <VotingList votings={simpleVotingResults} />
            </CardWrapper>
          </div>
          <CommentSection
            comments={comments}
            totalComments={139}
            pointDetails={point}
            speakerClubs={speakerClubs}
          />
        </>
      }
    />
  );
}
