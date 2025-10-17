import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { getAllTopics } from '@/lib/queries/topic'
import { FileText, Lightbulb, TrendingUp } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tematy parlamentarne',
  description: 'Odkryj wszystkie tematy dyskutowane w polskim Sejmie',
}

export const revalidate = 3600

export default async function TopicsPage() {
  const topics = await getAllTopics(100)
  const topTopics = topics.slice(0, 3)
  const restTopics = topics.slice(3)

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tematy parlamentarne</h1>
            <p className="text-muted-foreground">
              Odkryj {topics.length} tematów dyskutowanych w Sejmie
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Topics */}
      {topTopics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Najczęściej dyskutowane</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {topTopics.map((topic, index) => (
              <Link
                key={topic.name}
                href={`/topics/${encodeURIComponent(topic.name)}`}
              >
                <CardWrapper className="group relative h-full overflow-hidden transition-all hover:shadow-xl hover:border-primary/50">
                  <div className="absolute right-3 top-3 rounded-full bg-primary/10 px-3 py-1 z-10">
                    <span className="text-xs font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors pr-12">
                        {topic.name}
                      </h3>
                      {topic.description && (
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {topic.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{topic.printCount}</span>
                        <span className="text-xs text-muted-foreground">druków</span>
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Topics Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Wszystkie tematy</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restTopics.map((topic) => (
            <Link
              key={topic.name}
              href={`/topics/${encodeURIComponent(topic.name)}`}
            >
              <CardWrapper className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{topic.printCount} {topic.printCount === 1 ? 'druk' : 'druków'}</span>
                  </div>
                </div>
              </CardWrapper>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
