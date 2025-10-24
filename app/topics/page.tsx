import { CardWrapper } from '@/components/ui/card-wrapper'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { getAllTopics } from '@/lib/queries/topic'
import { FileText, Lightbulb, TrendingUp } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { TopicsClient } from './topics-client'

export const metadata: Metadata = {
  title: 'Tematy parlamentarne - Centrum Eksploracji',
  description:
    'Eksploruj i przeszukuj tematy dyskutowane w polskim Sejmie. Interaktywne narzędzie do odkrywania tematów parlamentarnych.',
}

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
  const topics = await getAllTopics(100)
  const featuredTopics = topics.slice(0, 10)
  const allTopics = topics.slice(3)

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Featured Topics Carousel */}
      {featuredTopics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Wyróżnione tematy</h2>
            <span className="text-sm text-muted-foreground">
              Top {featuredTopics.length} najczęściej dyskutowanych
            </span>
          </div>

          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {featuredTopics.map((topic, index) => (
                <CarouselItem
                  key={topic.name}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Link href={`/topics/${encodeURIComponent(topic.name)}`}>
                    <CardWrapper className="group relative h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl">
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-primary/10 px-3 py-1">
                        <span className="text-xs font-semibold text-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <h3 className="pr-12 text-xl font-bold leading-tight transition-colors group-hover:text-primary">
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
                            <span className="text-sm font-medium">
                              {topic.printCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              druków
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardWrapper>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      )}

      {/* Interactive Topics Explorer */}
      <TopicsClient topics={allTopics} />
    </div>
  )
}
