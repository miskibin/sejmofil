import { CardWrapper } from "@/components/ui/card-wrapper";
import {
  getPointDetails,
  getRelatedPoint,
  getAdjacentPoints,
} from "@/lib/supabase/queries";
import { Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getClubAndIdsByNames } from "@/lib/queries/person";
import { TopicAttitudeChart } from "./components/topic-attitude-chart";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";
import {
  getLatestStageAndPerformer,
  getPrintsByNumbersAndVotings,
} from "@/lib/queries/print";
import { Metadata } from "next";
import { getVotingDetails } from "@/lib/api/sejm";
import { DiscussionEntries } from "./components/discussion-entries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { VotingSection } from "./components/voting-section";
import { PrintSection } from "./components/print-section";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Update the SummarySection component to handle null values
const SummarySection = ({
  content,
  title,
  subtitle,
  emptyText,
}: {
  content: string | null | undefined;
  title: string;
  subtitle: string;
  emptyText: string;
}) => (
  <CardWrapper
    title={title}
    subtitle={subtitle}
    className="h-full"
    headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
  >
    {content && content !== "null" ? (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    ) : (
      <EmptyState text={emptyText} image="empty.svg" />
    )}
  </CardWrapper>
);

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

  // Add this near other data fetching
  const adjacentPoints = await getAdjacentPoints(
    id,
    point.proceeding_day.proceeding.number
  );

  // Check for related point
  const relatedPoint = point.official_point
    ? await getRelatedPoint(
        id,
        point.official_point,
        point.proceeding_day.proceeding.number
      )
    : null;

  const [category, title] = point.topic.split(" | ");
  // Get clubs for speakers
  const speakerNames = [
    ...new Set(point.statements.map((s) => s.speaker_name)),
  ];
  const speakerClubs = await getClubAndIdsByNames(speakerNames);

  // Helper function to determine voting result
  const getVotingResult = (votingResult: (typeof votingResults)[0]) => {
    if (!votingResult) return null;

    const yesVotes = votingResult.votes.filter((v) => v.vote === "YES").length;
    const noVotes = votingResult.votes.filter((v) => v.vote === "NO").length;

    return {
      passed: yesVotes > noVotes && votingResult.totalVoted > 230,
      total: votingResult.totalVoted,
      yes: yesVotes,
      no: noVotes,
    };
  };

  // Fetch prints if available
  const prints =
    point.print_numbers?.length > 0
      ? await getPrintsByNumbersAndVotings(
          point.print_numbers.map(String),
          point.voting_numbers
        )
      : [];

  // Add this after the print fetch:
  const printsWithStages = await Promise.all(
    prints.map(async (print) => {
      const stageInfo = await getLatestStageAndPerformer(print.number);
      return {
        ...print,
        stageInfo: {
          ...stageInfo,
          performerName: stageInfo.performerName ?? undefined,
          performerCode: stageInfo.performerCode ?? undefined,
        },
      };
    })
  );

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
        if (s.statement_ai?.topic_attitude) {
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

  // Fetch voting results if available
  const votingResults =
    point.voting_numbers?.length > 0
      ? await Promise.all(
          point.voting_numbers.map((num) =>
            getVotingDetails(point.proceeding_day.proceeding.number, num)
          )
        )
      : [];

  // Process voting data for each voting result
  const processVotingData = (votes: { club: string; vote: string }[]) =>
    Object.entries(
      votes.reduce((acc, vote) => {
        if (!acc[vote.club]) {
          acc[vote.club] = { club: vote.club, yes: 0, no: 0, abstain: 0 };
        }
        if (vote.vote === "YES") acc[vote.club].yes++;
        if (vote.vote === "NO") acc[vote.club].no++;
        if (vote.vote === "ABSTAIN") acc[vote.club].abstain++;
        return acc;
      }, {} as Record<string, { club: string; yes: number; no: number; abstain: number }>)
    ).map(([, data]) => data);

  // Process voting data for all votings
  const votingData = votingResults.map((result) => ({
    topic: result.topic,
    data: processVotingData(result.votes),
    result: getVotingResult(result),
  }));

  // Add helper function to get speaker info

  return (
    <div className="space-y-6">
      {relatedPoint &&
        (relatedPoint.proceeding_day?.date > point.proceeding_day.date ? (
          <Alert
            variant={"destructive"}
            className="flex justify-center items-center"
          >
            <AlertDescription>
              Dyskusja została przerwana.{" "}
              <Link
                href={`/proceedings/${number}/${date}/${relatedPoint.id}`}
                className="font-medium underline underline-offset-4"
              >
                Zobacz kontynuację
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert
            variant={"default"}
            className="flex justify-center items-center"
          >
            <AlertDescription>
              Kontynuacja dyskusji.{" "}
              <Link
                href={`/proceedings/${number}/${date}/${relatedPoint.id}`}
                className="font-medium underline underline-offset-4"
              >
                Zobacz początek
              </Link>
            </AlertDescription>
          </Alert>
        ))}

      {/* Header section - Make it more responsive */}
      <div className="space-y-2 sm:space-y-4 space-x-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {title}
          </h1>
        </div>
        <Badge className="text-xs sm:text-sm" variant="default">
          {category}
        </Badge>
        <Badge className="text-xs sm:text-sm" variant="outline">
          {point.official_point}
        </Badge>
      </div>

      {/* First Bento grid - Adjust column spans for different breakpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 lg:gap-x-6">
        {/* Main topic section - Make it full width on mobile */}
        <div className="col-span-full lg:col-span-4 lg:row-span-3 sm:mb-0 mb-6">
          <SummarySection
            title="Główne Zagadnienia"
            subtitle="Kluczowe tematy"
            content={point.summary_main?.main_topics}
            emptyText="Brak głównych zagadnień"
          />
        </div>

        {/* Stats cards - Adjust grid for better mobile layout */}
        <div className="col-span-full lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Emocjonalność"
            value={`${Math.round(
              point.statements.reduce(
                (acc, s) =>
                  acc + (s.statement_ai?.speaker_rating?.emotions || 0),
                0
              ) / point.statements.length
            )}/5`}
            category="Legislacja"
          />
          <StatCard
            title="Wypowiedzi"
            value={Math.round(point.statements.length)}
            category="Legislacja"
          />
          <StatCard
            title="Uczestnicy"
            value={Math.round(speakerNames.length)}
            category="Legislacja"
          />
        </div>

        {/* Combined card with all tabs */}
        <CardWrapper className="col-span-full lg:col-span-8 my-0 h-full min-h-96">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className=" bg-gray-100">
              <TabsTrigger value="summary">Podsumowanie</TabsTrigger>
              <TabsTrigger value="issues">Kwestie sporne</TabsTrigger>
              <TabsTrigger value="positions">Stanowiska</TabsTrigger>
              <TabsTrigger value="prints">Dokumenty</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {point.summary_main?.outtakes || "Brak podsumowania"}
                </ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="issues" className="mt-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {point.summary_main?.unresolved || "Brak kwestii spornych"}
                </ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="positions" className="mt-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {point.summary_main?.key_positions || "Brak stanowisk"}
                </ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="prints" className="mt-6">
              <PrintSection prints={printsWithStages} />
            </TabsContent>
          </Tabs>
        </CardWrapper>
      </div>
      {/* Second grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Charts and analysis section */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper title="Analiza klubów" subtitle="Stosunek do tematu">
            <div className="w-full overflow-x-auto">
              <TopicAttitudeChart data={chartData} />
            </div>
          </CardWrapper>
        </div>

        {/* Voting section */}
        <div className="col-span-full lg:col-span-6">
          <VotingSection votingData={votingData} />
        </div>

        {/* Replace the Statements section with: */}
        <div className="col-span-full">
          <CardWrapper
            title="Wypowiedzi"
            subtitle={`Przebieg dyskusji (${point.statements.length})`}
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
            sourceDescription="
              Dane pochodzą z oficjalnej strony sejmowej i analizowane przez AI. 
              Ocena emocji w wypowiedzieach opisana jest w zakładce `o projekcie`. 
              Odpowiedzi wyróżnione - to takie, które zostały zakwalifikowane jako najbardziej szokujące i emocjonalne. 
            "
            sourceUrls={[
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings/${point.proceeding_day.proceeding.number}/${point.proceeding_day.date}/transcripts/0`,
            ]}
          >
            <DiscussionEntries
              statements={point.statements}
              speakerClubs={speakerClubs}
              proceedingNumber={point.proceeding_day.proceeding.number}
              proceedingDate={point.proceeding_day.date}
              initialMode="featured"
            />
          </CardWrapper>
        </div>
      </div>

      {/* Add this at the bottom of the JSX, before the closing div */}
      <div className="flex justify-between items-center pt-6 border-t">
        {adjacentPoints.prev ? (
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link
              href={`/proceedings/${number}/${adjacentPoints.prev.proceeding_day.date}/${adjacentPoints.prev.id}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Poprzedni punkt
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {adjacentPoints.next ? (
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link
              href={`/proceedings/${number}/${adjacentPoints.next.proceeding_day.date}/${adjacentPoints.next.id}`}
            >
              Następny punkt
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
