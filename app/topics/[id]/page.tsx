import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProceedingPointsByPrintNumbers } from '@/lib/supabase/getProceedingPointsByPrintNumbers'
import {
  getProcessesByTopic,
  getPrintsByTopic,
  getSimilarTopics,
  getTopicByName,
} from '@/lib/queries/topic'
import { BookOpen, FileText, Lightbulb, Sparkles } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const topicName = decodeURIComponent(id)
  const topic = await getTopicByName(topicName)

  return {
    title: topic?.name || 'Temat',
    description: topic?.description || `Szczegóły tematu: ${topicName}`,
  }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topicName = decodeURIComponent(id)

  // Fetch all data in parallel
  const [topic, processes, prints, similarTopics] = await Promise.all([
    getTopicByName(topicName),
    getProcessesByTopic(topicName, 10),
    getPrintsByTopic(topicName, 20),
    getSimilarTopics(topicName, 6),
  ])

  if (!topic) {
    notFound()
  }

  // Get proceeding points related to the prints
  const printNumbers = prints.map((p) => p.number)
  const proceedingPoints = await getProceedingPointsByPrintNumbers(
    printNumbers,
    15
  )

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header Section with gradient background */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-3">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                Temat parlamentarny
              </Badge>
              <h1 className="text-3xl font-bold">{topic.name}</h1>
            </div>
          </div>
          {topic.description && (
            <p className="max-w-3xl text-lg text-muted-foreground">
              {topic.description}
            </p>
          )}
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardWrapper className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl font-bold text-primary">
            {processes.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Procesów legislacyjnych
          </div>
        </CardWrapper>
        <CardWrapper className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl font-bold text-primary">
            {proceedingPoints.length}
          </div>
          <div className="text-sm text-muted-foreground">Punktów obrad</div>
        </CardWrapper>
        <CardWrapper className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl font-bold text-primary">{prints.length}</div>
          <div className="text-sm text-muted-foreground">Druków sejmowych</div>
        </CardWrapper>
      </div>

      {/* Main Content - Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Processes and Proceedings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Processes Section */}
          {processes.length > 0 && (
            <CardWrapper
              title="Procesy legislacyjne"
              headerIcon={<BookOpen className="h-5 w-5 text-primary" />}
            >
              <div className="space-y-4">
                {processes.map((process) => (
                  <Link
                    key={process.number}
                    href={`/processes/${process.number}`}
                    className="block space-y-2 rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {process.documentType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Proces #{process.number}
                          </span>
                        </div>
                        <h3 className="font-medium leading-tight">
                          {process.title}
                        </h3>
                        {process.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {process.description}
                          </p>
                        )}
                      </div>
                      {process.changeDate && (
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(process.changeDate).toLocaleDateString(
                            'pl-PL'
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}

          {/* Proceedings Section */}
          {proceedingPoints.length > 0 && (
            <CardWrapper
              title="Punkty obrad"
              headerIcon={<FileText className="h-5 w-5 text-primary" />}
            >
              <div className="space-y-4">
                {proceedingPoints.map((point) => (
                  <Link
                    key={point.id}
                    href={`/proceedings/${point.proceeding_day.proceeding.number}/${point.proceeding_day.date}/${point.id}`}
                    className="block space-y-2 rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium leading-tight">
                          {point.topic}
                        </h3>
                        {point.summary_tldr && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {point.summary_tldr}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {point.proceeding_day.proceeding.title}
                          </Badge>
                          {point.voting_numbers &&
                            point.voting_numbers.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {point.voting_numbers.length} głosowań
                              </Badge>
                            )}
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(point.proceeding_day.date).toLocaleDateString(
                          'pl-PL'
                        )}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>

        {/* Right Column - Similar Topics and Prints */}
        <div className="space-y-6">
          {/* Similar Topics */}
          {similarTopics.length > 0 && (
            <CardWrapper
              title="Podobne tematy"
              headerIcon={
                <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
              }
              subtitle="Na podstawie embeddings AI"
            >
              <div className="space-y-3">
                {similarTopics.map((similarTopic) => (
                  <Link
                    key={similarTopic.id}
                    href={`/topics/${encodeURIComponent(similarTopic.name)}`}
                    className="block space-y-1 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100 hover:shadow-md"
                  >
                    <h4 className="font-medium">{similarTopic.name}</h4>
                    {similarTopic.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {similarTopic.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}

          {/* Related Prints */}
          {prints.length > 0 && (
            <CardWrapper
              title="Druki sejmowe"
              headerIcon={<FileText className="h-5 w-5 text-primary" />}
            >
              <div className="space-y-3">
                {prints.slice(0, 10).map((print) => (
                  <Link
                    key={print.number}
                    href={`/prints/${print.number}`}
                    className="block space-y-1 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">
                            #{print.number}
                          </span>
                          {print.type && (
                            <Badge variant="outline" className="text-xs">
                              {print.type}
                            </Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm">{print.title}</p>
                      </div>
                      {print.documentDate && (
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(print.documentDate).toLocaleDateString(
                            'pl-PL'
                          )}
                        </span>
                      )}
                    </div>
                    {print.summary && (
                      <div className="prose prose-sm max-w-none line-clamp-2 text-xs text-muted-foreground">
                        <ReactMarkdown>{print.summary}</ReactMarkdown>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>
      </div>

      {/* Empty States */}
      {processes.length === 0 &&
        proceedingPoints.length === 0 &&
        prints.length === 0 && (
          <CardWrapper>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">Brak danych</h3>
              <p className="text-sm text-muted-foreground">
                Nie znaleziono procesów, obrad ani druków związanych z tym
                tematem.
              </p>
            </div>
          </CardWrapper>
        )}
    </div>
  )
}
