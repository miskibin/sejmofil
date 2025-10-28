import { CardWrapper } from '@/components/ui/card-wrapper'
import { TopicGraph } from '@/components/topic-graph'
import { getProceedingPointsByPrintNumbers } from '@/lib/supabase/getProceedingPointsByPrintNumbers'
import {
  getPrintsByEntity,
  getSimilarEntities,
  getEntityByName,
} from '@/lib/queries/topic'
import { Building2, Hash, FileText, MessageSquare, Vote, Network } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const entityName = decodeURIComponent(id)
  const entity = await getEntityByName(entityName)

  return {
    title: `${entity?.name || 'Encja'} | Sejmofil`,
    description:
      entity?.description ||
      `Druki i punkty obrad dotyczące: ${entityName}`,
  }
}

export const revalidate = 3600

export default async function EntityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const entityName = decodeURIComponent(id)

  // Auto-detect entity type
  const entity = await getEntityByName(entityName)

  if (!entity) {
    notFound()
  }

  const [prints, similarEntities] = await Promise.all([
    getPrintsByEntity(entityName, entity.type!, 50),
    getSimilarEntities(entityName, entity.type!, 5),
  ])

  const printNumbers = prints.map((p) => p.number)
  const points = await getProceedingPointsByPrintNumbers(printNumbers, 50)

  const Icon = entity.type === 'Topic' ? Hash : Building2
  const typeLabel = entity.type === 'Topic' ? 'Temat' : 'Organizacja'

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{entity.name}</h1>
        </div>
        {entity.description && (
          <p className="text-muted-foreground">{entity.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardWrapper className="transition-all hover:border-primary/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Druki</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{prints.length}</div>
        </CardWrapper>
        <CardWrapper className="transition-all hover:border-primary/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Punkty obrad</span>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{points.length}</div>
        </CardWrapper>
        <CardWrapper className="transition-all hover:border-primary/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Głosowania</span>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {points.reduce(
              (acc, p) => acc + (p.voting_numbers?.length || 0),
              0
            )}
          </div>
        </CardWrapper>
        <CardWrapper className="transition-all hover:border-primary/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Podobne</span>
            <Network className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{similarEntities.length}</div>
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
              subtitle={`${prints.length} druków`}
            >
              <div className="space-y-2">
                {prints.slice(0, 10).map((print) => (
                  <Link
                    key={print.number}
                    href={`/prints/${print.number}`}
                    className="block group"
                  >
                    <div className="rounded-lg border p-3 transition-all hover:border-primary/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <h3 className="font-medium leading-tight transition-colors group-hover:text-primary">
                            {print.title}
                          </h3>
                          {print.summary && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {print.summary.split(' ').slice(0, 20).join(' ')}
                              ...
                            </p>
                          )}
                        </div>
                        {print.documentDate && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(print.documentDate).toLocaleDateString(
                              'pl-PL'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
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
            >
              <div className="space-y-2">
                {points.slice(0, 10).map((point) => (
                  <Link
                    key={point.id}
                    href={`/proceedings/${point.proceeding_day.proceeding.number}`}
                    className="block group"
                  >
                    <div className="rounded-lg border p-3 transition-all hover:border-primary/50">
                      <div className="space-y-1">
                        <h3 className="font-medium leading-tight transition-colors group-hover:text-primary">
                          {point.topic}
                        </h3>
                        {point.summary_tldr && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {point.summary_tldr.split(' ').slice(0, 20).join(' ')}
                            ...
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(
                              point.proceeding_day.date
                            ).toLocaleDateString('pl-PL')}
                          </span>
                          {point.voting_numbers?.length > 0 && (
                            <span>• {point.voting_numbers.length} głosowań</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Similar Entities Graph */}
          {similarEntities.length > 0 && (
            <CardWrapper
              title={`Podobne ${entity.type === 'Topic' ? 'tematy' : 'organizacje'}`}
              subtitle={`${similarEntities.length}`}
            >
              <TopicGraph
                currentTopic={entity.name}
                currentTopicId={id}
                similarTopics={similarEntities.map((e) => ({
                  ...e,
                  id: encodeURIComponent(e.name),
                }))}
              />
            </CardWrapper>
          )}
        </div>
      </div>
    </div>
  )
}
