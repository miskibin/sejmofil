import { EnvoyCard } from '@/components/envoy-card'
import { PointCard } from '@/components/point-card'
import { PrintCard } from '@/components/print-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { searchPersons } from '@/lib/queries/person'
import { searchPrints } from '@/lib/queries/print'
import { searchEntities } from '@/lib/queries/topic'
import { searchPoints } from '@/lib/supabase/searchPoints'
import { Calendar, FileText, Users2, Hash } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { CardWrapper } from '@/components/ui/card-wrapper'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>
}): Promise<Metadata> {
  const { q: query } = await searchParams

  if (!query) {
    return {
      title: 'Wyszukiwarka | Sejmofil',
      description: 'Przeszukuj druki sejmowe, posłów, punkty obrad, tematy i organizacje.',
    }
  }

  return {
    title: `Wyniki dla: ${query} | Sejmofil`,
    description: `Wyniki wyszukiwania dla: ${query}. Znajdź druki sejmowe, posłów, punkty obrad, tematy i organizacje.`,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>
}) {
  const { q: query } = await searchParams

  if (!query) {
    return (
      <div className="container mx-auto mt-20 px-4">
        <h1 className="mb-4 text-2xl font-bold">Wyszukiwarka</h1>
        <p>Wprowadź tekst aby wyszukać druki sejmowe, posłów, punkty obrad, tematy lub organizacje.</p>
      </div>
    )
  }

  const [prints, persons, points, entities] = await Promise.all([
    searchPrints(query),
    searchPersons(query),
    searchPoints(query),
    searchEntities(query),
  ])

  const hasResults =
    prints.length > 0 || persons.length > 0 || points.length > 0 || entities.length > 0

  if (!hasResults) {
    return (
      <div className="container mx-auto mt-20 px-4">
        <h1 className="mb-4 text-2xl font-bold">
          Wyniki wyszukiwania dla: {query}
        </h1>
        <p>Nie znaleziono wyników dla podanego zapytania.</p>
      </div>
    )
  }

  const defaultTab =
    points.length > 0 
      ? 'points' 
      : entities.length > 0
        ? 'entities'
        : persons.length > 0 
          ? 'persons' 
          : 'prints'

  return (
    <div className="container mx-auto mt-20 px-4">
      <h1 className="mb-8 text-2xl font-bold">
        Wyniki wyszukiwania dla: {query}
      </h1>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger
            value="points"
            disabled={points.length === 0}
            className="flex gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Punkty</span>
            <span className="text-xs">{points.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="entities"
            disabled={entities.length === 0}
            className="flex gap-2"
          >
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Encje</span>
            <span className="text-xs">{entities.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="persons"
            disabled={persons.length === 0}
            className="flex gap-2"
          >
            <Users2 className="h-4 w-4" />
            <span className="hidden sm:inline">Posłowie</span>
            <span className="text-xs">{persons.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="prints"
            disabled={prints.length === 0}
            className="flex gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Druki</span>
            <span className="text-xs">{prints.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          {points.map((point) => (
            <PointCard
              key={point.id}
              point={point}
              proceedingNumber={point.proceeding_day.proceeding.number}
              date={point.proceeding_day.date}
              searchQuery={query}
            />
          ))}
        </TabsContent>

        <TabsContent value="entities" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity) => (
            <Link key={entity.name} href={`/entities/${encodeURIComponent(entity.name)}`}>
              <CardWrapper className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <h3 className="flex-1 font-semibold leading-tight transition-colors group-hover:text-primary">
                      {entity.name}
                    </h3>
                  </div>
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
          ))}
        </TabsContent>

        <TabsContent
          value="persons"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {persons.map((person) => (
            <EnvoyCard key={person.id} envoy={person} />
          ))}
        </TabsContent>

        <TabsContent value="prints" className="space-y-4">
          {prints.map((print) => (
            <PrintCard key={print.number} print={print} searchQuery={query} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
