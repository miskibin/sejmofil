import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { getAllTopics } from '@/lib/queries/topic'
import { Lightbulb } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wszystkie tematy',
  description: 'Przeglądaj wszystkie tematy parlamentarne',
}

export default async function TopicsPage() {
  const topics = await getAllTopics(100)

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/20 p-3">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tematy parlamentarne</h1>
            <p className="text-muted-foreground">
              Wszystkie tematy dyskutowane w Sejmie
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${encodeURIComponent(topic.name)}`}
          >
            <CardWrapper className="h-full transition-all hover:shadow-lg hover:border-primary/50">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-tight">
                    {topic.name}
                  </h3>
                  <Badge variant="secondary">{topic.printCount}</Badge>
                </div>
                {topic.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  {topic.printCount}{' '}
                  {topic.printCount === 1 ? 'druk' : 'druków'}
                </div>
              </div>
            </CardWrapper>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {topics.length === 0 && (
        <CardWrapper>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">Brak tematów</h3>
            <p className="text-sm text-muted-foreground">
              Nie znaleziono żadnych tematów w bazie danych.
            </p>
          </div>
        </CardWrapper>
      )}
    </div>
  )
}
