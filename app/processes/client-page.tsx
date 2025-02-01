'use client'

import { Search, Calendar as CalendarIcon } from 'lucide-react'
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
import { usePrints } from '@/lib/hooks/use-prints'

const DOCUMENT_TYPES = ['projekt ustawy', 'projekt uchwały', 'wniosek']

export default function ProcessClientPage({
  initialPrints,
  initialTopics,
}: {
  initialPrints: PrintListItem[]
  initialTopics: { name: string; count: number }[]
}) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  const { 
    prints, 
    photoUrls, 
    filters, 
    setFilters, 
    fetchNextPage, 
    hasNextPage,
    isLoading,
    isFetching,
  } = usePrints(initialPrints, initialTopics)

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      console.log('Loading more...', { hasNextPage, inView, isFetching })
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage])

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white p-4 flex flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1"
          value={filters.searchTerm}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[200px] justify-start text-left font-normal ${!filters.dateFrom && 'text-muted-foreground'}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? (
                format(filters.dateFrom, 'PPP')
              ) : (
                <span>Pick a date from</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) =>
                setFilters((prev) => ({ ...prev, dateFrom: date }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[200px] justify-start text-left font-normal ${!filters.dateTo && 'text-muted-foreground'}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? (
                format(filters.dateTo, 'PPP')
              ) : (
                <span>Pick a date to</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) =>
                setFilters((prev) => ({ ...prev, dateTo: date }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:flex-1 sm:min-w-[300px]">
          <Input
            placeholder="Szukaj projektów ustawy..."
            value={filters.searchTerm}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-full sm:w-auto sm:min-w-[140px] justify-between"
              >
                Typ dokumentu{' '}
                {filters.selectedTypes.length ? `(${filters.selectedTypes.length})` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedTypes: prev.selectedTypes.includes(type)
                          ? prev.selectedTypes.filter((t) => t !== type)
                          : [...prev.selectedTypes, type]
                      }))} 
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

          <div className="flex flex-wrap gap-2">
            {filters.categories.map((category) => (
              <Button
                key={category}
                variant={filters.selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setFilters((prev) => ({ ...prev, selectedCategory: category }))}
                size="sm"
                className="h-10 flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-4">
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
                      <span>
                        {new Date(print.date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{print.type}</span>
                      <span>•</span>
                      <span>{print.categories.join(', ')}</span>
                    </div>
                    {print.status && (
                      <div className="mt-1 text-primary">
                        {print.status}
                      </div>
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
