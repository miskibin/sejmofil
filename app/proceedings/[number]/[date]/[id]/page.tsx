import { MarkdownContent, SummaryCard, InfoDisplay } from '@/components/shared-content-components'
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
import { getAdjacentPoints } from '@/lib/supabase/getAdjacentPoints'
import { getPointDetails } from '@/lib/supabase/getPointDetails'
import { getRelatedPoint } from '@/lib/supabase/getRelatedPoint'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { DiscussionEntries } from './components/discussion-entries'
import { TopicAttitudeChart } from './components/topic-attitude-chart'

import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getVotingResultsByNumbrs } from '@/lib/queries/proceeding'
import { VotingList } from '../../../../../components/voting-list'
import { PrintSection } from './components/print-section'

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

  // Add this near other data fetching
  const adjacentPoints = await getAdjacentPoints(
    id,
    point.proceeding_day.proceeding.number
  )

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

  // Add helper function to get speaker info

  // Define available tabs with their content
  const tabs = [
    {
      value: 'summary',
      label: 'Podsumowanie',
      content: point.summary_main?.outtakes,
    },
    {
      value: 'issues',
      label: 'Kwestie sporne',
      content: point.summary_main?.unresolved,
    },
    {
      value: 'positions',
      label: 'Stanowiska',
      content: point.summary_main?.key_positions,
    },
    {
      value: 'official',
      label: 'Informacje',
      content: 'has-content', // Always show this tab
    },
    {
      value: 'prints',
      label: 'Dokumenty',
      content: printsWithStages.length > 0 ? 'has-content' : null,
    },
  ].filter((tab) => tab.content) // Only keep tabs with content

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

      {/* Hero Header section - improved visual hierarchy */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="text-xs sm:text-sm" variant="default">
            {category}
          </Badge>
          <Badge className="text-xs sm:text-sm" variant="outline">
            {point.official_point}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(point.proceeding_day.date).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <h1 className="break-words text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {point.summary_tldr && (
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {point.summary_tldr}
          </p>
        )}
      </div>

      {/* Quick stats bar - more compact and informative */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{point.statements.length}</p>
          <p className="text-sm text-muted-foreground">Wypowiedzi</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{speakerNames.length}</p>
          <p className="text-sm text-muted-foreground">Uczestników</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
            <p className="text-2xl font-bold">
              {Math.round(
                point.statements.reduce(
                  (acc, s) =>
                    acc + (s.statement_ai?.speaker_rating?.emotions || 0),
                  0
                ) / point.statements.length
              )}
              /5
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Emocjonalność</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">
            {simpleVotingResults.length > 0
              ? simpleVotingResults.length
              : '-'}
          </p>
          <p className="text-sm text-muted-foreground">Głosowań</p>
        </div>
      </div>

      {/* Main content - improved layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Summary and key info (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Summary tabs - more prominent */}
          {tabs.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" fill="#76052a" />
                <h2 className="text-xl font-bold">Analiza AI</h2>
              </div>
              <Tabs
                defaultValue={tabs[0].value}
                className="flex flex-1 flex-col"
              >
                <TabsList className="w-full justify-start overflow-x-auto">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="mt-6">
                  {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                      {tab.value === 'prints' ? (
                        <PrintSection prints={printsWithStages} />
                      ) : tab.value === 'official' ? (
                        <InfoDisplay
                          items={[
                            {
                              label: 'Temat oficjalny',
                              value: point.official_topic,
                            },
                            {
                              label: 'Punkt porządku dziennego',
                              value: point.official_point,
                            },
                          ]}
                        />
                      ) : (
                        <MarkdownContent content={tab.content} />
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </Card>
          )}

          {/* Voting Results - if available */}
          {simpleVotingResults.length > 0 && (
            <CardWrapper
              title="Głosowania"
              subtitle={`${simpleVotingResults.length} głosowań w tej sprawie`}
            >
              <VotingList votings={simpleVotingResults} />
            </CardWrapper>
          )}
        </div>

        {/* Right column - Secondary info (1/3 width) */}
        <div className="space-y-6">
          {/* Main topics card - always show if available */}
          {point.summary_main?.main_topics && (
            <SummaryCard
              title="Główne Zagadnienia"
              subtitle="Kluczowe tematy"
              content={point.summary_main?.main_topics}
              emptyText="Brak głównych zagadnień"
            />
          )}

          {/* Club analysis - only show if sufficient data */}
          {chartData.length >= 7 && (
            <CardWrapper title="Analiza klubów" subtitle="Stosunek do tematu">
              <TopicAttitudeChart data={chartData} />
            </CardWrapper>
          )}

          {/* Proceeding info card */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Informacje o posiedzeniu</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posiedzenie:</span>
                <span className="font-medium">
                  #{point.proceeding_day.proceeding.number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {new Date(point.proceeding_day.date).toLocaleDateString('pl-PL')}
                </span>
              </div>
              {printsWithStages.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Druki:</span>
                  <span className="font-medium">{printsWithStages.length}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Discussion section - full width for better readability */}
      <CardWrapper
        title="Przebieg dyskusji"
        subtitle={`${point.statements.length} wypowiedzi`}
        headerIcon={
          <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
        }
        sourceDescription="
          Dane pochodzą z oficjalnej strony sejmowej i analizowane przez AI. 
          Ocena emocji w wypowiedzieach opisana jest w zakładce `o projekcie`. 
          Odpowiedzi wyróżnione - to takie, które zostały zakwalifikowane jako najbardziej szokujące i emocjonalne. 
        "
        sourceUrls={[
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings/${point.proceeding_day.proceeding.number}/${point.proceeding_day.date}/transcripts/pdf`,
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

      {/* Add this at the bottom of the JSX, before the closing div */}
      <div className="flex items-center justify-between border-t pt-6">
        {adjacentPoints.prev ? (
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link
              href={`/proceedings/${number}/${adjacentPoints.prev.proceeding_day.date}/${adjacentPoints.prev.id}`}
              prefetch={true}
            >
              <ChevronLeft className="h-4 w-4" />
              Poprzedni punkt
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {adjacentPoints.next ? (
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link
              href={`/proceedings/${number}/${adjacentPoints.next.proceeding_day.date}/${adjacentPoints.next.id}`}
              prefetch={true}
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
  )
}
