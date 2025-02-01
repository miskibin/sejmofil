'use client'
import {
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PrintListItem } from '@/lib/types/print'
import ReactMarkdown from 'react-markdown'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { truncateText } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useInView } from 'react-intersection-observer'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { useEffect } from 'react'
import { PrintsFilters, usePrints } from '@/lib/hooks/use-prints'
import { DOCUMENT_TYPES } from '@/lib/constants'

function FilterBar({
  filters,
  setFilters,
  topics,
  hiddenCount,
  onShowMore,
}: {
  filters: PrintsFilters
  setFilters: (fn: (prev: PrintsFilters) => PrintsFilters) => void
  topics: { name: string; count: number }[]
  hiddenCount: number
  onShowMore: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Typ dokumentu
            {filters.selectedTypes.length > 0 && (
              <span className="ml-2 text-xs opacity-70">
                ({filters.selectedTypes.length})
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-1">
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    selectedTypes: prev.selectedTypes.includes(type)
                      ? prev.selectedTypes.filter((t) => t !== type)
                      : [...prev.selectedTypes, type],
                  }))
                }
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-primary/20"
              >
                <div
                  className={`h-3 w-3 rounded-sm border ${
                    filters.selectedTypes.includes(type)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}
                />
                {type}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant={
          filters.selectedCategory === 'wszystkie' ? 'default' : 'outline'
        }
        onClick={() =>
          setFilters((prev) => ({ ...prev, selectedCategory: 'wszystkie' }))
        }
        size="sm"
        className="h-8"
      >
        wszystkie
      </Button>
      {topics.map((topic) => (
        <Button
          key={topic.name}
          variant={
            filters.selectedCategory === topic.name ? 'default' : 'outline'
          }
          onClick={() =>
            setFilters((prev) => ({ ...prev, selectedCategory: topic.name }))
          }
          size="sm"
          className="h-8"
        >
          {topic.name}
          <span className="ml-2 text-xs opacity-70">({topic.count})</span>
        </Button>
      ))}
      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowMore}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          +{hiddenCount} więcej
        </Button>
      )}
    </div>
  )
}

export default function ProcessClientPage({
  initialPrints,
  initialTopics,
}: {
  initialPrints: PrintListItem[]
  initialTopics: { name: string; count: number }[]
}) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' })
  const {
    prints,
    photoUrls,
    filters,
    setFilters,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    commonTopics,
    hiddenCount,
    setShowAllTopics,
  } = usePrints(initialPrints, initialTopics)

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) fetchNextPage()
  }, [inView, hasNextPage, isFetching, fetchNextPage])

  return (
    <div className="space-y-4">
      <div className="mb-8 space-y-4 p-3">
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Szukaj projektów ustawy..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="flex-1"
          />

          <FilterBar
            filters={filters}
            setFilters={setFilters}
            topics={commonTopics}
            hiddenCount={hiddenCount}
            onShowMore={() => setShowAllTopics(true)}
          />
        </div>
      </div>

      {/* Loader */}
      {isFetching && (
        <div className="fixed inset-x-0 top-10 h-1 z-50">
          <div className="animate-progress bg-primary h-full w-full transform-gpu" />
        </div>
      )}

      <div className="grid gap-6">
        {prints.map((print) => (
          <Link
            key={print.number}
            href={`/processes/${print.number}`}
            className="block transition-opacity hover:opacity-90"
          >
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <div className="flex-1 p-4 space-y-3">
                  <h2 className="font-semibold">{print.title}</h2>
                  <div className="prose-sm">
                    <ReactMarkdown>
                      {truncateText(print.summary || '', 600)}
                    </ReactMarkdown>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-2">
                      <span>{new Date(print.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{print.type}</span>
                      <span>•</span>
                      <span>{print.categories.join(', ')}</span>
                    </div>
                    {print.status && (
                      <div className="mt-1 text-primary">{print.status}</div>
                    )}
                  </div>
                </div>
                <div className="relative h-[200px] sm:h-auto sm:w-[300px]">
                  <Image
                    src={photoUrls[print.number]}
                    alt={print.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {(isLoading || isFetching) && (
          <div className="text-center py-4">Loading...</div>
        )}
      </div>

      <div ref={ref} className="h-20" />
    </div>
  )
}
