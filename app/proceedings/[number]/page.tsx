import { notFound } from "next/navigation";
import { getProceedingDetails } from "@/lib/supabase/queries";
import { getClubAndIdsByNames } from "@/lib/queries/person";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { CalendarDays, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { number: string };
}

export default async function ProceedingPage({ params }: PageProps) {
  const proceeding = await getProceedingDetails(parseInt(params.number));
  if (!proceeding) notFound();

  // Calculate statistics
  const allStatements = proceeding.proceeding_day.flatMap((day) =>
    day.proceeding_point_ai.flatMap((point) =>
      point.statements.map((s) => s.statement)
    )
  );

  const uniqueSpeakers = [...new Set(allStatements.map((s) => s.speaker_name))];
  const speakerInfo = await getClubAndIdsByNames(uniqueSpeakers);

  // Calculate average emotions
  const averageEmotions = Math.round(
    allStatements.reduce(
      (acc, s) => acc + (s.statement_ai?.speaker_rating?.emotions || 0),
      0
    ) / allStatements.length
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{proceeding.title}</h1>
        <div className="flex flex-wrap gap-2">
          {proceeding.dates.map((date) => (
            <Badge key={date} variant="outline">
              {new Date(date).toLocaleDateString("pl-PL")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Punkty"
          value={proceeding.proceeding_day.reduce(
            (acc, day) => acc + day.proceeding_point_ai.length,
            0
          )}
          category="Posiedzenie"
        />
        <StatCard
          title="Wypowiedzi"
          value={allStatements.length}
          category="Posiedzenie"
        />
        <StatCard
          title="Emocjonalność"
          value={`${averageEmotions}/5`}
          category="Posiedzenie"
        />
      </div>

      {/* Days Grid */}
      <div className="grid gap-6">
        {proceeding.proceeding_day.map((day) => (
          <CardWrapper
            key={day.id}
            title={new Date(day.date).toLocaleDateString("pl-PL")}
            subtitle={`${day.proceeding_point_ai.length} punktów`}
            headerIcon={<CalendarDays className="h-5 w-5 text-primary" />}
          >
            <div className="space-y-4">
              {day.proceeding_point_ai.map((point, index) => (
                <div key={point.id} className="space-y-2">
                  <Link href={`/points/${point.id}`} className="group block">
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                      <span className="inline-block w-8 text-muted-foreground">
                        {index + 1}.
                      </span>
                      {point.topic.split(" | ")[1] || point.topic}
                    </h3>
                    {point.summary_tldr && (
                      <p className="text-sm text-muted-foreground pl-8">
                        {point.summary_tldr}
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </CardWrapper>
        ))}
      </div>
    </div>
  );
}
