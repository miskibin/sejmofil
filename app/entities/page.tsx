import { CardWrapper } from '@/components/ui/card-wrapper'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { getAllEntities } from '@/lib/queries/topic'
import { FileText, TrendingUp } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { EntitiesClient } from './entities-client'

export const metadata: Metadata = {
  title: 'Tematy i Organizacje parlamentarne - Centrum Eksploracji',
  description:
    'Eksploruj i przeszukuj tematy oraz organizacje dyskutowane w polskim Sejmie. Interaktywne narzędzie do odkrywania tematów i organizacji parlamentarnych.',
}

export const dynamic = 'force-dynamic'

export default async function EntitiesPage() {
  const entities = await getAllEntities(['Topic', 'Organization'], 200)
  const featuredEntities = entities.slice(0, 10)
  const allEntities = entities.slice(3)

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Featured Entities Carousel */}
      {featuredEntities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Najczęściej dyskutowane</h2>
            <span className="text-sm text-muted-foreground">
              Top {featuredEntities.length}
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
              {featuredEntities.map((entity, index) => {
                const href = `/entities/${encodeURIComponent(entity.name)}`

                return (
                  <CarouselItem
                    key={entity.name}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Link href={href}>
                      <CardWrapper className="group relative h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl">
                        <div className="absolute right-3 top-3 z-10 rounded-full bg-primary/10 px-3 py-1">
                          <span className="text-xs font-semibold text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="space-y-3 pt-2">
                          <h3 className="pr-12 text-lg font-bold leading-tight transition-colors group-hover:text-primary">
                            {entity.name}
                          </h3>
                          {entity.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {entity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{entity.printCount} druków</span>
                          </div>
                        </div>
                      </CardWrapper>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      )}

      {/* Interactive Explorer */}
      <EntitiesClient entities={allEntities} />
    </div>
  )
}
