import Image from "next/image";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { getPointDetails } from "@/lib/supabase/queries";
import { Sparkles, Check, XCircle } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getClubAndIdsByNames } from "@/lib/queries/person";
import { TopicAttitudeChart } from "./topic-attitude-chart";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";
import { getPrintsByNumbers } from "@/lib/queries/print";
import { Metadata } from "next";
import { getVotingDetails } from "@/lib/api/sejm";
import { VotingResultsChart } from "./voting-results-chart";
import { FaRegFilePdf } from "react-icons/fa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DiscussionEntries } from "./discussion-entries";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const dynamic = "force-dynamic";

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
  params: Promise<{ id: number }>;
  searchParams?: Promise<{ showAll?: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const showAll = (await searchParams)?.showAll === "true";
  const point = await getPointDetails(id, showAll);
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
      ? await getPrintsByNumbers(point.print_numbers.map(String))
      : [];

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

  console.log(clubAttitudes);

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
  const getSpeakerInfo = (name: string) => {
    return speakerClubs.find((s) => s.name === name);
  };

  return (
    <div className="space-y-6">
      {/* Header section - Make it more responsive */}
      <div className="space-y-2 sm:space-y-4 space-x-4">
        <h1 className="text-2xl sm:text-3xl font-bold break-words">{title}</h1>
        <Badge className="text-xs sm:text-sm" variant="default">
          {category}
        </Badge>
        <Badge className="text-xs sm:text-sm" variant="secondary">
          Data: {point.proceeding_day.date}
        </Badge>
        <Badge className="text-xs sm:text-sm" variant="secondary">
          Posiedzenie: {point.proceeding_day.proceeding.number}
        </Badge>
      </div>

      {/* First Bento grid - Adjust column spans for different breakpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Main topic section - Make it full width on mobile */}
        <div className="col-span-full lg:col-span-4 lg:row-span-3">
          <CardWrapper
            title="Główne Zagadnienia"
            className="h-full"
            subtitle="Kluczowe tematy"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{point.summary_main.main_topics}</ReactMarkdown>
            </div>
          </CardWrapper>
        </div>

        {/* Stats cards - Adjust grid for better mobile layout */}
        <div className="col-span-full lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* Secondary sections - Adjust spans for better flow */}
        <div className="col-span-full md:col-span-1 lg:col-span-4 lg:row-span-2">
          <CardWrapper
            title="Wnioski"
            subtitle="Podsumowanie"
            className="h-full"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{point.summary_main.outtakes}</ReactMarkdown>
            </div>
          </CardWrapper>
        </div>

        <div className="col-span-full md:col-span-1 lg:col-span-4 lg:row-span-2">
          <CardWrapper
            className="h-full"
            title="Kwestie sporne"
            subtitle="Nie rozwiązane problemy"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{point.summary_main.unresolved}</ReactMarkdown>
            </div>
          </CardWrapper>
        </div>
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

        {/* Key positions section */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper
            title="Kluczowe stanowiska"
            subtitle="Stanowiska klubów"
            className="h-full"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{point.summary_main.key_positions}</ReactMarkdown>
            </div>
          </CardWrapper>
        </div>

        {/* Voting section */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper
            title="Głosowania"
            className="h-full"
            subtitle={
              votingResults.length > 0
                ? `Głosowań: ${votingResults.length}`
                : "Brak głosowań"
            }
          >
            {votingResults.length > 0 ? (
              <div>
                <Carousel className="w-[90%] mx-auto">
                  <CarouselContent>
                    {votingData.map((voting, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {voting.result?.passed ? (
                                <Check className="h-5 w-5 text-success" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <h3 className="font-medium text-sm">
                                {voting.topic}
                              </h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Za: {voting.result?.yes} Przeciw:{" "}
                              {voting.result?.no}
                            </div>
                          </div>
                          <VotingResultsChart data={voting.data} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-4 mt-4">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                </Carousel>
              </div>
            ) : (
              <div className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/street.svg"
                    width={350}
                    height={350}
                    alt="No committees"
                  />
                </div>
                <p className="text-gray-500">Brak głosowań</p>
              </div>
            )}
          </CardWrapper>
        </div>

        {/* Print section - Add responsive padding and spacing */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper
            title="Druki"
            className="h-full"
            subtitle={
              prints.length > 0 ? "Omawiane druki" : "Brak powiązanych druków"
            }
          >
            {prints.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {prints.map((print) => (
                  <div
                    key={print.number}
                    className="p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="text-sm font-medium mb-2 flex justify-between gap-2">
                      <span>{print.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(print.deliveryDate).toLocaleDateString(
                          "pl-PL"
                        )}
                      </span>
                    </h4>
                    {print.attachments.length > 0 && (
                      <div className="space-y-2">
                        {print.attachments.map((attachment) => (
                          <a
                            key={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-primary bg-white p-2 rounded-lg shadow-sm"
                          >
                            <span>
                              <FaRegFilePdf className="h-6 w-6 inline mx-2" />
                              {attachment}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/explore.svg"
                    width={250}
                    height={250}
                    alt="No committees"
                  />
                </div>
                <p className="text-gray-500">Brak druków</p>
              </div>
            )}
          </CardWrapper>
        </div>

        {/* Replace the entire Statements section with: */}
        <div className="col-span-full">
          <CardWrapper
            title="Wypowiedzi"
            subtitle={`Przebieg dyskusji (${point.statements.length})`}
          >
            <Accordion type="single" collapsible>
              <AccordionItem value="statements">
                <AccordionTrigger>Pokaż wypowiedzi</AccordionTrigger>
                <AccordionContent>
                  <DiscussionEntries
                    statements={point.statements}
                    speakerInfo={getSpeakerInfo}
                    proceedingNumber={point.proceeding_day.proceeding.number}
                    proceedingDate={point.proceeding_day.date}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
