import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { TopicGraph } from '@/components/topic-graph'
import { getProceedingPointsByPrintNumbers } from '@/lib/supabase/getProceedingPointsByPrintNumbers'
import {
  getPrintsByTopic,
  getSimilarTopics,
  getTopicByName,
} from '@/lib/queries/topic'
import {
  Calendar,
  FileText,
  Lightbulb,
  MessageSquare,
  Vote,
  Network,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const topicName = decodeURIComponent(id)
  const topic = await getTopicByName(topicName)

  return {
    title: `${topic?.name || 'Temat'} | Sejmofil`,
    description: topic?.description || `Druki i punkty obrad dotyczące tematu: ${topicName}`,
  }
}

export const revalidate = 3600

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topicName = decodeURIComponent(id)

  const [topic, prints, similarTopics] = await Promise.all([
    getTopicByName(topicName),
    getPrintsByTopic(topicName, 50),
    getSimilarTopics(topicName, 5),
  ])

  if (!topic) {
    notFound()
  }

  const printNumbers = prints.map((p) => p.number)
  const points = await getProceedingPointsByPrintNumbers(printNumbers, 50)

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/20 p-3">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <Badge variant="secondary" className="mb-2">
                Temat parlamentarny
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight">
                {topic.name}
              </h1>
              {topic.description && (
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {topic.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardWrapper
          title="Druki"
          headerIcon={<FileText className="h-4 w-4 text-primary" />}
          className="hover:border-primary/50 transition-all"
        >
          <div className="text-3xl font-bold">{prints.length}</div>
        </CardWrapper>
        <CardWrapper
          title="Punkty obrad"
          variant="inverted"
          headerIcon={<MessageSquare className="h-4 w-4 text-primary" />}
          className="hover:border-primary/50 transition-all"
        >
          <div className="text-3xl font-bold">{points.length}</div>
        </CardWrapper>
        <CardWrapper
          title="Głosowania"
          headerIcon={<Vote className="h-4 w-4 text-primary" />}
          className="hover:border-primary/50 transition-all"
        >
          <div className="text-3xl font-bold">
            {points.reduce(
              (acc, p) => acc + (p.voting_numbers?.length || 0),
              0
            )}
          </div>
        </CardWrapper>
        <CardWrapper
          title="Powiązane tematy"
          headerIcon={<Network className="h-4 w-4 text-primary" />}
          className="hover:border-primary/50 transition-all"
        >
          <div className="text-3xl font-bold">{similarTopics.length}</div>
        </CardWrapper>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Druki */}
          {prints.length > 0 && (
            <CardWrapper
              title="Druki sejmowe"
              headerIcon={<FileText className="h-5 w-5" />}
              showMoreLink={
                prints.length > 5
                  ? `/prints?topic=${encodeURIComponent(topic.name)}`
                  : undefined
              }
            >
              <div className="space-y-3">
                {prints.slice(0, 5).map((print) => (
                  <Link key={print.number} href={`/prints/${print.number}`}>
                    <div className="flex items-start justify-between gap-4 space-y-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {print.type && (
                            <Badge variant="outline">{print.type}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                          {print.title}
                        </h3>
                        {print.summary && (
                          <div className="prose prose-sm max-w-none text-muted-foreground">
                            <Markdown>
                              {print.summary.split(' ').slice(0, 30).join(' ') +
                                (print.summary.split(' ').length > 30
                                  ? '...'
                                  : '')}
                            </Markdown>
                          </div>
                        )}
                      </div>
                      {print.documentDate && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(print.documentDate).toLocaleDateString(
                            'pl-PL'
                          )}
                        </div>
                      )}
                    </div>
                    <hr className="my-2 border-t" />
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}

          {/* Punkty Obrad */}
          {points.length > 0 && (
            <CardWrapper
              title="Punkty obrad"
              subtitle={`${points.length} punktów`}
              headerIcon={<MessageSquare className="h-5 w-5" />}
              showMoreLink={
                points.length > 5
                  ? `/proceedings?topic=${encodeURIComponent(topic.name)}`
                  : undefined
              }
            >
              <div className="space-y-3">
                {points.slice(0, 5).map((point) => (
                  <Link
                    key={point.id}
                    href={`/proceedings/${point.proceeding_day.proceeding.number}`}
                  >
                    <div className="flex items-start justify-between gap-4 space-y-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {point.proceeding_day.proceeding.title}
                          </Badge>
                          {point.voting_numbers?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Vote className="h-3 w-3 mr-1" />
                              {point.voting_numbers.length} głosowań
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                          {point.topic}
                        </h3>
                        {point.summary_tldr && (
                          <div className="prose prose-sm max-w-none text-muted-foreground">
                            <Markdown>
                              {point.summary_tldr
                                .split(' ')
                                .slice(0, 30)
                                .join(' ') +
                                (point.summary_tldr.split(' ').length > 30
                                  ? '...'
                                  : '')}
                            </Markdown>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(point.proceeding_day.date).toLocaleDateString(
                          'pl-PL'
                        )}
                      </div>
                    </div>
                    <hr className="my-2 border-t" />
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Graph Visualization */}
          {similarTopics.length > 0 && (
            <CardWrapper
              title="Podobne tematy"
              subtitle={`${similarTopics.length} ${similarTopics.length === 1 ? 'temat' : similarTopics.length < 5 ? 'tematy' : 'tematów'}`}
              headerIcon={<Network className="h-5 w-5" />}
            >
              <TopicGraph
                currentTopic={topic.name}
                currentTopicId={id}
                similarTopics={similarTopics.map((t) => ({
                  ...t,
                  id: encodeURIComponent(t.name),
                }))}
              />
            </CardWrapper>
          )}

          {/* Related Prints */}
          {prints.length > 0 && (
            <CardWrapper
              title="Powiązane druki"
              subtitle={`${prints.length} druków`}
              headerIcon={<FileText className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {prints.slice(0, 5).map((print) => (
                  <Link
                    key={print.number}
                    href={`/prints/${print.number}`}
                    className="block group"
                  >
                    <div className="flex items-start justify-between gap-4 space-y-2">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                          Druk {print.number}
                        </h3>
                        {print.title && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {print.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <hr className="my-2 border-t" />
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>
      </div>
    </div>
  )
}
