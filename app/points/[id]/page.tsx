import { CardWrapper } from "@/components/ui/card-wrapper";
import { getPointDetails } from "@/lib/supabase/queries";
import { Sparkles, Check,  XCircle } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getClubsByNames } from "@/lib/queries/person";
import { TopicAttitudeChart } from "./topic-attitude-chart";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";
import { getPrintsByNumbers } from "@/lib/queries/print";
import { Metadata } from "next";
import { getVotingDetails } from "@/lib/api/sejm";
import { VotingResultsChart } from "./voting-results-chart";
import { FaRegFilePdf } from "react-icons/fa";

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
  const speakerClubs = await getClubsByNames(speakerNames);

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
    attitude: data.total / data.count,
    count: data.count,
  }));

  console.log(speakerClubs);

  // Fetch voting results if available
  const votingResults =
    point.voting_numbers?.length > 0
      ? await Promise.all(
          point.voting_numbers.map((num) =>
            getVotingDetails(point.proceeding_day.proceeding.number, num)
          )
        )
      : [];

  // Process voting data for chart
  const votingData =
    votingResults.length > 0
      ? Object.entries(
          votingResults[0].votes.reduce((acc, vote) => {
            if (!acc[vote.club]) {
              acc[vote.club] = { club: vote.club, yes: 0, no: 0, abstain: 0 };
            }
            if (vote.vote === "YES") acc[vote.club].yes++;
            if (vote.vote === "NO") acc[vote.club].no++;
            if (vote.vote === "ABSTAIN") acc[vote.club].abstain++;
            return acc;
          }, {} as Record<string, { club: string; yes: number; no: number; abstain: number }>)
        ).map(([, data]) => data)
      : [];

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

  const votingResult = votingResults[0]
    ? getVotingResult(votingResults[0])
    : null;

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

        {/* Voting and Print sections */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper
            title="Głosowanie"
            subtitle={
              votingResults.length > 0
                ? votingResults[0].topic
                : "Brak głosowania"
            }
            headerIcon={
              votingResult &&
              (votingResult.passed ? (
                <Check className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-primary" />
              ))
            }
          >
            {votingResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Głosów: {votingResults[0].totalVoted}</span>
                </div>
                <VotingResultsChart data={votingData} />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Brak danych o głosowaniu
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
                            key={`${process.env.NEXT_PUBLIC_API_URL}/prints/${print.number}/${attachment}`}
                            href={`${process.env.NEXT_PUBLIC_API_URL}/prints/${print.number}/${attachment}`}
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
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Brak powiązanego druku
              </div>
            )}
          </CardWrapper>
        </div>

        {/* Statements section - Improve mobile layout */}
        <div className="col-span-full">
          <CardWrapper
            title="Wypowiedzi"
            subtitle={`Przebieg dyskusji (${point.statements.length})`}
          >
            <div className="space-y-4 sm:space-y-6">
              {point.statements.map((statement) => (
                <div
                  key={statement.id}
                  className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-semibold text-primary">
                      {statement.speaker_name}
                    </h3>
                    {statement.statement_ai?.speaker_rating && (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {["manipulation", "facts", "logic", "emotions"].map(
                          (key) =>
                            statement.statement_ai.speaker_rating[key] && (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="text-xs"
                                title={key}
                              >
                                {key === "manipulation" && "Manipulacja"}
                                {key === "facts" && "Fakty"}
                                {key === "logic" && "Logika"}
                                {key === "emotions" && "Emocje"}:{" "}
                                {statement.statement_ai.speaker_rating[key]} / 5
                              </Badge>
                            )
                        )}
                      </div>
                    )}
                  </div>

                  {statement.statement_ai?.summary_tldr && (
                    <p className="text-sm text-gray-600">
                      {statement.statement_ai.summary_tldr}
                    </p>
                  )}

                  {statement.statement_ai?.citations && (
                    <div className="space-y-2">
                      {statement.statement_ai.citations.map((citation, idx) => (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-primary/30 pl-3 italic text-sm text-gray-600"
                        >
                          {citation}
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
