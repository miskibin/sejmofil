import StatCard from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { getProceedingDayDetails } from '@/lib/supabase/getProceedingDayDetails'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    number: string
    date: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number, date } = await params
  const proceedingDay = await getProceedingDayDetails(parseInt(number), date)

  if (!proceedingDay) {
    return {
      title: 'Dzień posiedzenia nie znaleziony',
    }
  }

  return {
    title: `${proceedingDay.proceeding.title} - ${new Date(date).toLocaleDateString('pl-PL')} | Sejmofil`,
    description: `Dzień posiedzenia ${number} z dnia ${new Date(date).toLocaleDateString('pl-PL')}. Zobacz punkty obrad i wypowiedzi.`,
  }
}

export default async function ProceedingDayPage({ params }: PageProps) {
  const { number, date } = await params
  const proceedingDay = await getProceedingDayDetails(parseInt(number), date)

  if (!proceedingDay) notFound()

  // Get all speakers from all points
  const allSpeakers = [
    ...new Set(
      proceedingDay.proceeding_point_ai.flatMap((point) =>
        point.statements.map((s) => s.statement.speaker_name)
      )
    ),
  ]

  // Calculate statistics
  const totalStatements = proceedingDay.proceeding_point_ai.reduce(
    (acc, point) => acc + point.statements.length,
    0
  )

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
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          {proceedingDay.proceeding.title}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Punkty"
          value={proceedingDay.proceeding_point_ai.length}
          category="Dzień"
        />
        <StatCard title="Wypowiedzi" value={totalStatements} category="Dzień" />
        <StatCard title="Mówcy" value={allSpeakers.length} category="Dzień" />
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
            subtitle={point.topic.split(' | ')[1] || point.topic}
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
                href={`/proceedings/${number}/${date}/${point.id}`}
                className="mt-4 block text-sm text-primary hover:underline"
              >
                Zobacz szczegóły →
              </Link>
            </div>
          </CardWrapper>
        ))}
      </div>
    </div>
  )
}
