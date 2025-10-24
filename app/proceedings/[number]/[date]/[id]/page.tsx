import { MarkdownContent, SummaryCard } from '@/components/shared-content-components'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import StatCard from '@/components/stat-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { getClubAndIdsByNames } from '@/lib/queries/person'
import {
  getLatestStageAndPerformer,
  getPrintsByNumbersAndVotings,
} from '@/lib/queries/print'
import { getPointDetails } from '@/lib/supabase/getPointDetails'
import { getRelatedPoint } from '@/lib/supabase/getRelatedPoint'
import { Sparkles } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { DiscussionEntries } from './components/discussion-entries'
import { TopicAttitudeChart } from './components/topic-attitude-chart'
import { QuickInsights } from './components/quick-insights'
import { VotingCardEnhanced } from './components/voting-card-enhanced'
import { PostVoting } from '@/components/post-voting'

import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getVotingResultsByNumbrs } from '@/lib/queries/proceeding'
import { PrintSection } from './components/print-section'
import { getVoteCounts } from '@/lib/supabase/votes'

// Use ISR instead of force-dynamic
export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({}: {
  params: Promise<{ id: number }>
}): Promise<Metadata> {
  return {
    title: `Punkt obrad | Sejmofil`,
    description: `Analiza punktu obrad w Sejmie.`,
  }
}

export default async function PointDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: number; number: string; date: string }>
  searchParams?: Promise<{ showAll?: string }>
}) {
  const { id, number, date } = await params
  if (!id) notFound()

  const showAll = (await searchParams)?.showAll === 'true'
  const point = await getPointDetails(id, showAll)

  // Check for related point
  const relatedPoint = point.official_point
    ? await getRelatedPoint(
        id,
        point.official_point,
        point.proceeding_day.proceeding.number
      )
    : null

  const [category, title] = point.topic.split(' | ')
  // Get clubs for speakers
  const speakerNames = [...new Set(point.statements.map((s) => s.speaker_name))]
  const speakerClubs = await getClubAndIdsByNames(speakerNames)

  // Fetch prints if available
  const prints =
    point.print_numbers?.length > 0
      ? await getPrintsByNumbersAndVotings(point.print_numbers.map(String))
      : []

  // Add this after the print fetch:
  const printsWithStages = await Promise.all(
    prints.map(async (print) => {
      const stageInfo = await getLatestStageAndPerformer(print.number)
      return {
        ...print,
        stageInfo: {
          ...stageInfo,
          performerName: stageInfo.performerName ?? undefined,
          performerCode: stageInfo.performerCode ?? undefined,
        },
      }
    })
  )

  // Group statements by speaker to avoid repeated lookups
  const statementsBySpeaker = new Map<string, typeof point.statements>()
  point.statements.forEach((st) => {
    if (!statementsBySpeaker.has(st.speaker_name)) {
      statementsBySpeaker.set(st.speaker_name, [])
    }
    statementsBySpeaker.get(st.speaker_name)?.push(st)
  })

  // Only process valid clubs
  const clubAttitudes = speakerClubs
    .filter((clubInfo) => clubInfo.club !== null) // skip if club is null
    .reduce(
      (acc, { name, club }) => {
        if (!acc[club]) {
          acc[club] = { total: 0, count: 0 }
        }
        const speakerStatements = statementsBySpeaker.get(name) || []
        speakerStatements.forEach((s) => {
          if (
            s.statement_ai?.topic_attitude?.score &&
            s.statement_ai?.topic_attitude?.score !== 0
          ) {
            acc[club].total += s.statement_ai.topic_attitude.score
            acc[club].count += 1
          }
        })
        return acc
      },
      {} as Record<string, { total: number; count: number }>
    )

  // Prepare data for topic attitude chart
  const chartData = Object.entries(clubAttitudes).map(([club, data]) => ({
    club,
    attitude: data.total / data.count - 3,
    count: data.count,
  }))

  // Fetch voting results if available
  const simpleVotingResults =
    point.voting_numbers?.length > 0
      ? await getVotingResultsByNumbrs(
          point.proceeding_day.proceeding.number,
          point.voting_numbers
        )
      : []

  // Get vote counts for this point
  const initialVotes = await getVoteCounts(id)

  // Define available tabs with their content
  const tabs = [
    {
      value: 'discussion',
      label: 'Dyskusja',
      icon: '💬',
      content: 'has-content',
    },
    {
      value: 'summary',
      label: 'Podsumowanie AI',
      icon: '✨',
      content: point.summary_main?.outtakes,
    },
    {
      value: 'prints',
      label: 'Dokumenty',
      icon: '📄',
      content: printsWithStages.length > 0 ? 'has-content' : null,
    },
    {
      value: 'issues',
      label: 'Kwestie sporne',
      icon: '⚠️',
      content: point.summary_main?.unresolved,
    },
    {
      value: 'positions',
      label: 'Stanowiska',
      icon: '📍',
      content: point.summary_main?.key_positions,
    },
  ].filter((tab) => tab.content)

  // Calculate average emotionality
  const avgEmotionality = Math.round(
    point.statements.reduce(
      (acc, s) => acc + (s.statement_ai?.speaker_rating?.emotions || 0),
      0
    ) / point.statements.length
  )

  return (
    <div className="space-y-6">
      {relatedPoint &&
        (relatedPoint.proceeding_day?.date > point.proceeding_day.date ? (
          <Alert
            variant={'destructive'}
            className="flex items-center justify-center"
          >
            <AlertDescription>
              Dyskusja została przerwana.{' '}
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
            variant={'default'}
            className="flex items-center justify-center"
          >
            <AlertDescription>
              Kontynuacja dyskusji.{' '}
              <Link
                href={`/proceedings/${number}/${date}/${relatedPoint.id}`}
                className="font-medium underline underline-offset-4"
              >
                Zobacz początek
              </Link>
            </AlertDescription>
          </Alert>
        ))}

      {/* Hero Section with Key Info */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-lg">
        {/* AI-Generated Image Header with enhanced gradient overlay */}
        <div className="relative h-64 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          <ImageWithFallback
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${number}/${date}/${id}.jpg`}
            alt={title}
            fallbackSrc="/default.jpg"
            className="object-cover object-center opacity-80"
            fill
            sizes="100vw"
          />
          {/* Strong dark gradient with blur for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 backdrop-blur-[2px]" />
          
          {/* Content overlay on image */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="default" className="shadow-md backdrop-blur-sm">
                {category}
              </Badge>
              <Badge variant="secondary" className="shadow-md backdrop-blur-sm">
                Punkt {point.official_point}
              </Badge>
            </div>
            <h1 className="mb-2 break-words text-2xl font-bold text-white sm:text-3xl lg:text-4xl [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">
              {title}
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-gradient-to-b from-background to-card">
          {/* Voting and Quick Stats in one row */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b">
            <div className="grid grid-cols-3 gap-4 flex-1 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Emocjonalność</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-base ${star <= avgEmotionality ? 'text-primary' : 'text-muted-foreground/30'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Wypowiedzi</span>
                <span className="text-2xl font-bold text-foreground">{point.statements.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Mówcy</span>
                <span className="text-2xl font-bold text-foreground">{speakerNames.length}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <PostVoting pointId={id} initialVotes={initialVotes} />
            </div>
          </div>
        </div>
      </div>

      {/* TL;DR Summary - More Prominent */}
      {point.summary_tldr && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Najważniejsze w skrócie</h2>
            </div>
            <p className="text-base leading-relaxed">
              {point.summary_tldr}
            </p>
          </div>
        </Card>
      )}

      {/* Quick Insights Section */}
      {point.statements.length > 0 && (
        <QuickInsights
          statements={point.statements}
          speakerClubs={speakerClubs}
        />
      )}

      {/* Voting and Club Analysis - Side by Side */}
      {(simpleVotingResults.length > 0 || chartData.length >= 7) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Voting Results Card */}
          <div className="min-w-0 h-full">
            {simpleVotingResults.length > 0 ? (
              <VotingCardEnhanced votings={simpleVotingResults} />
            ) : (
              <Card className="p-5 h-full">
                <h2 className="mb-4 text-xl font-semibold">Głosowania</h2>
                <EmptyState image="/empty.svg" text="Brak głosowań" />
              </Card>
            )}
          </div>

          {/* Club Analysis Card */}
          <div className="min-w-0 h-full">
            {chartData.length >= 7 ? (
              <Card className="p-5 h-full">
                <h2 className="mb-4 text-xl font-semibold">
                  Stosunek klubów do tematu
                </h2>
                <div className="w-full overflow-x-auto">
                  <TopicAttitudeChart data={chartData} />
                </div>
              </Card>
            ) : (
              <Card className="p-5 h-full">
                <h2 className="mb-4 text-xl font-semibold">
                  Stosunek klubów do tematu
                </h2>
                <EmptyState image="/empty.svg" text="Za mało danych o stanowiskach klubów" />
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area with Tabs */}
      <div className="rounded-lg border bg-card">
        <Tabs defaultValue={tabs[0].value} className="flex flex-col">
          <div className="border-b px-6">
            <TabsList className="h-14 w-full justify-start overflow-x-auto bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-14 gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  <span className="hidden sm:inline">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-5">
            {/* Discussion Tab */}
            <TabsContent value="discussion" className="mt-0">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Przebieg dyskusji · {point.statements.length} wypowiedzi od {speakerNames.length} mówców
                  </h2>
                </div>
              </div>
              <DiscussionEntries
                statements={point.statements}
                speakerClubs={speakerClubs}
                proceedingNumber={point.proceeding_day.proceeding.number}
                proceedingDate={point.proceeding_day.date}
                initialMode="featured"
              />
            </TabsContent>

            {/* AI Summary Tabs */}
            <TabsContent value="summary" className="mt-0">
              <h2 className="mb-3 text-lg font-semibold">
                Podsumowanie AI · Najważniejsze wnioski z dyskusji
              </h2>
              <MarkdownContent content={point.summary_main?.outtakes} />
            </TabsContent>

            <TabsContent value="issues" className="mt-0">
              <h2 className="mb-3 text-lg font-semibold">
                Kwestie sporne · Nierozstrzygnięte punkty dyskusji
              </h2>
              <MarkdownContent content={point.summary_main?.unresolved} />
            </TabsContent>

            <TabsContent value="positions" className="mt-0">
              <h2 className="mb-3 text-lg font-semibold">
                Stanowiska klubów · Kluczowe pozycje partii politycznych
              </h2>
              <MarkdownContent content={point.summary_main?.key_positions} />
            </TabsContent>

            {/* Prints Tab */}
            <TabsContent value="prints" className="mt-0">
              <h2 className="mb-3 text-lg font-semibold">
                Dokumenty · Druki sejmowe związane z tym punktem
              </h2>
              <PrintSection prints={printsWithStages} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
