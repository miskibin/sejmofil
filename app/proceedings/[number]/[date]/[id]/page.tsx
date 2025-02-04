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
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour
// Update the SummarySection component to handle null values
const SummarySection = ({
  content,
  title,
  subtitle,
  emptyText,
}: {
  content: string | null | undefined
  title: string
  subtitle: string
  emptyText: string
}) => (
  <CardWrapper
    title={title}
    subtitle={subtitle}
    className="h-full"
    headerIcon={<Sparkles className="h-5 w-5 text-primary" fill="#76052a" />}
  >
    {content && content !== 'null' ? (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    ) : (
      <EmptyState text={emptyText} image="empty.svg" />
    )}
  </CardWrapper>
)

const TabContent = ({ content }: { content: string | null | undefined }) => {
  if (!content || content === 'null') return null
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

// Add new OfficialInfo component
const OfficialInfo = ({
  official_topic,
  official_point,
}: {
  official_topic: string
  official_point: string
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Temat oficjalny
      </h3>
      <p className="text-sm">{official_topic || 'Brak oficjalnego tematu'}</p>
    </div>
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Punkt porządku dziennego
      </h3>
      <p className="text-sm">{official_point || 'Brak numeru punktu'}</p>
    </div>
  </div>
)

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

      {/* Header section - Make it more responsive */}
      <div className="space-x-4 space-y-2 sm:space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="break-words text-2xl font-bold sm:text-3xl">
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

      <div className="grid auto-rows-min grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-6">
        {/* Main topic section - Make it full width on mobile */}
        <div className="col-span-full lg:col-span-4">
          <SummarySection
            title="Główne Zagadnienia"
            subtitle="Kluczowe tematy"
            content={point.summary_main?.main_topics}
            emptyText="Brak głównych zagadnień"
          />
        </div>

        {/* Stats cards - Adjust grid for better mobile layout */}
        <div className="col-span-full mt-4 flex h-full flex-col gap-4 sm:mt-0 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              headerIcon={
                <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
              }
              sourceDescription="Emocje mierzone są na podstawie metryk, opisanych w zakładce 'o projekcie'. Każda wypowiedź jest oceniana w skali od 1 do 5"
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

          {tabs.length > 0 && (
            <Card className="flex min-h-96 flex-1 flex-col p-4">
              <Tabs
                defaultValue={tabs[0].value}
                className="flex flex-1 flex-col"
              >
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex-1">
                  {tabs.map((tab) => (
                    <TabsContent
                      key={tab.value}
                      value={tab.value}
                      className="mt-6 h-full"
                    >
                      {tab.value === 'prints' ? (
                        <PrintSection prints={printsWithStages} />
                      ) : tab.value === 'official' ? (
                        <OfficialInfo
                          official_topic={point.official_topic}
                          official_point={point.official_point}
                        />
                      ) : (
                        <TabContent content={tab.content} />
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </Card>
          )}
        </div>
      </div>

      {/* Second grid section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Charts and analysis section */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper title="Analiza klubów" subtitle="Stosunek do tematu">
            <div className="w-full overflow-x-auto">
              {chartData.length >= 7 ? (
                <TopicAttitudeChart data={chartData} />
              ) : (
                <EmptyState
                  text="Za mało danych do wyświetlenia analizy klubów"
                  image="/empty.svg"
                />
              )}
            </div>
          </CardWrapper>
        </div>

        {/* Voting section */}
        <div className="col-span-full lg:col-span-6">
          <CardWrapper
            title="Głosowania"
            className="h-full"
            subtitle="Wyniki głosowań"
          >
            <VotingList votings={simpleVotingResults} />
          </CardWrapper>
        </div>

        {/* Replace the Statements section with: */}
        <div className="col-span-full">
          <CardWrapper
            title="Wypowiedzi"
            subtitle={`Przebieg dyskusji (${point.statements.length})`}
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
        </div>
      </div>

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
