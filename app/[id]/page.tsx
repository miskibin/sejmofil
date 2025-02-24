import { TopicAttitudeChart } from "@/components/charts/topic-attitiude";
import { EmptyState } from "@/components/empty-state";
import { getClubAndIdsByNames } from "@/lib/neo4j/person";
import { getPointDetails } from "@/lib/queries/pointDetails";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({}: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  return {
    title: `Punkt obrad | Sejmofil`,
    description: `Analiza punktu obrad w Sejmie.`,
  };
}

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
  // point.statements foreache statement_ai.topic_attitiude.score
  return (
    <>
      {chartData.length >= 7 ? (
        <TopicAttitudeChart data={chartData} />
      ) : (
        <EmptyState
          text="Za mało danych do wyświetlenia analizy klubów"
          image="/empty.svg"
        />
      )}
    </>
  );
}
