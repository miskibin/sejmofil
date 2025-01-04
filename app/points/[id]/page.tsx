import { CardWrapper } from "@/components/ui/card-wrapper";
import { getPointDetails } from "@/lib/supabase/queries";
import { Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getClubsByNames } from "@/lib/queries/person";
import { TopicAttitudeChart } from "./topic-attitude-chart";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";

export const dynamic = "force-dynamic";

export default async function PointDetail({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  const point = await getPointDetails(id);
  console.log(id, point);
  const [category, title] = point.topic.split(" | ");

  // Get clubs for speakers
  const speakerNames = [...new Set(point.statements.map((s) => s.speaker_name))];
  const speakerClubs = await getClubsByNames(speakerNames);

  // Prepare data for topic attitude chart
  const clubAttitudes = speakerClubs.reduce((acc, { club }) => {
    if (!acc[club]) {
      acc[club] = { total: 0, count: 0 };
    }
    const statements = point.statements.filter(
      (s) =>
        speakerClubs.find((sc) => sc.name === s.speaker_name)?.club === club
    );
    statements.forEach((s) => {
      if (s.statement_ai?.topic_attitude) {
        acc[club].total += s.statement_ai.topic_attitude.score;
        acc[club].count += 1;
      }
    });
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const chartData = Object.entries(clubAttitudes).map(([club, data]) => ({
    club,
    attitude: data.total / data.count,
    count: data.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Badge className="text-sm" color="primary">
        {category}
      </Badge>

      {/* Bento grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-3 gap-6">
        {/* TLDR - Spans full width */}
        {/* <div className="col-span-full">
          <CardWrapper
            title="Podsumowanie"
            subtitle="W skrócie"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <ReactMarkdown className="prose prose-sm max-w-none">
              {point.summary_tldr}
            </ReactMarkdown>
          </CardWrapper>
        </div> */}

        {/* Main sections in grid */}

        <div className="col-span-4 row-span-3">
          <CardWrapper
            title="Główne Zagadnienia"
            className="h-full"
            subtitle="Kluczowe tematy"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {point.summary_main.split(/\d\.\s/).filter(Boolean)[0]}
              </ReactMarkdown>
            </div>
          </CardWrapper>
        </div>
        <div className="gap-6 col-span-8 grid grid-cols-3">
          <StatCard
            title="Emocjonalność"
            value={`${Math.round(point.statements.reduce(
              (acc, s) => acc + (s.statement_ai?.speaker_rating?.emotions || 0),
              0
            ) / point.statements.length)}/5`}
            category="Legislacja"
          />
          <StatCard title="Wypowiedzi" value={Math.round(point.statements.length)} category="Legislacja" />
          <StatCard title="Uczestnicy" value={Math.round(speakerNames.length)} category="Legislacja" />
        </div>
        <div className="col-span-4 row-span-2">
          <CardWrapper
            title="Główne Zagadnienia"
            subtitle="Kluczowe tematy"
            className="h-full"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {point.summary_main.split(/\d\.\s/).filter(Boolean)[3]}
              </ReactMarkdown>
            </div>
          </CardWrapper>
        </div>

        <div className="col-span-4 row-span-2">
          <CardWrapper
            className="h-full"
            title="Najważniejsze wnioski"
            subtitle="Podjęte ustalenia"
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {point.summary_main.split(/\d\.\s/).filter(Boolean)[2]}
              </ReactMarkdown>
            </div>
          </CardWrapper>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Stats and Charts section - Spans 2 columns */}
        <div className="col-span-full md:col-span-6">
          <CardWrapper title="Analiza klubów" subtitle="Stosunek do tematu">
            <TopicAttitudeChart data={chartData} />
          </CardWrapper>
        </div>
        <div className="col-span-6">
          <CardWrapper title="Kluczowe stanowiska" subtitle="Stanowiska klubów">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {point.summary_main.split(/\d\.\s/).filter(Boolean)[1]}
              </ReactMarkdown>
            </div>
          </CardWrapper>
        </div>
        {/* Empty sections for future content */}
        <div className="col-span-6">
          <CardWrapper title="Głosowanie" subtitle="Wyniki">
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Brak danych o głosowaniu
            </div>
          </CardWrapper>
        </div>

        <div className="col-span-6">
          <CardWrapper title="Druk" subtitle="Podsumowanie">
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Brak powiązanego druku
            </div>
          </CardWrapper>
        </div>

        {/* Statements section - Spans full width */}
        <div className="col-span-full">
          <CardWrapper title="Wypowiedzi" subtitle="Przebieg dyskusji">
            <div className="space-y-6">
              {point.statements.map((statement) => (
                <div
                  key={statement.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-primary">
                      {statement.speaker_name}
                    </h3>
                    {statement.statement_ai?.speaker_rating && (
                      <div className="flex gap-2">
                        {Object.entries(
                          statement.statement_ai.speaker_rating
                        ).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10"
                            title={key}
                          >
                            {key}: {Math.round(value * 100)}%
                          </span>
                        ))}
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                          {statement.statement_ai.topic_attitude.score > 3
                            ? "Pozytywny"
                            : "Negatywny"}
                        </span>
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
