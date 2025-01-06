import { notFound } from "next/navigation";
import { getProceedingDayDetails } from "@/lib/supabase/queries";
import { getClubAndIdsByNames } from "@/lib/queries/person";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { CalendarDays, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: {
    number: string;
    date: string;
  };
}

export default async function ProceedingDayPage({ params }: PageProps) {
  const { number, date } = await params;
  console.log(number, date);
  const proceedingDay = await getProceedingDayDetails(
    parseInt(number),
    date
  );

  if (!proceedingDay) notFound();

  // Get all speakers from all points
  const allSpeakers = [
    ...new Set(
      proceedingDay.proceeding_point_ai.flatMap((point) =>
        point.statements.map((s) => s.statement.speaker_name)
      )
    ),
  ];

  const speakerInfo = await getClubAndIdsByNames(Array.from(allSpeakers));

  // Calculate statistics
  const totalStatements = proceedingDay.proceeding_point_ai.reduce(
    (acc, point) => acc + point.statements.length,
    0
  );

  const averageEmotions = Math.round(
    proceedingDay.proceeding_point_ai.reduce(
      (acc, point) =>
        acc +
        point.statements.reduce(
          (sum, s) =>
            sum + (s.statement.statement_ai?.speaker_rating?.emotions || 0),
          0
        ),
      0
    ) / totalStatements
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/proceedings/${params.number}`}
            className="text-muted-foreground hover:text-primary"
          >
            Posiedzenie {proceedingDay.proceeding.number}
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold">
            {new Date(proceedingDay.date).toLocaleDateString("pl-PL")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {proceedingDay.proceeding.title}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Punkty"
          value={proceedingDay.proceeding_point_ai.length}
          icon={<FileText className="h-4 w-4" />}
          category="Dzień"
        />
        <StatCard
          title="Wypowiedzi"
          value={totalStatements}
          icon={<MessageSquare className="h-4 w-4" />}
          category="Dzień"
        />
        <StatCard
          title="Mówcy"
          value={allSpeakers.length}
          icon={<Users className="h-4 w-4" />}
          category="Dzień"
        />
        <StatCard
          title="Emocjonalność"
          value={`${averageEmotions}/5`}
          category="Dzień"
        />
      </div>

      {/* Points List */}
      <div className="grid gap-6">
        {proceedingDay.proceeding_point_ai.map((point, index) => (
          <CardWrapper
            key={point.id}
            title={`Punkt ${index + 1}`}
            subtitle={point.topic.split(" | ")[1] || point.topic}
            headerIcon={<CalendarDays className="h-5 w-5 text-primary" />}
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {point.summary_tldr}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {point.statements.length} wypowiedzi
                </Badge>
                {point.voting_numbers?.length > 0 && (
                  <Badge variant="outline">
                    {point.voting_numbers.length} głosowań
                  </Badge>
                )}
                {point.print_numbers?.length > 0 && (
                  <Badge variant="outline">
                    {point.print_numbers.length} druków
                  </Badge>
                )}
              </div>

              <Link
                href={`/points/${point.id}`}
                className="text-sm text-primary hover:underline block mt-4"
              >
                Zobacz szczegóły →
              </Link>
            </div>
          </CardWrapper>
        ))}
      </div>
    </div>
  );
}
