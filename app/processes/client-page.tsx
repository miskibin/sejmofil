'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PostVoting } from '@/components/post-voting'
import type { ProcessVoteCount } from '@/lib/supabase/processVotes'

const DOCUMENT_TYPES = [
  'projekt ustawy',
  'projekt uchwały',
  'lista kandydatów',
  'wniosek',
  'informacja rządowa',
  'informacja innych organów',
  'zawiadomienie',
  'sprawozdanie',
  'wniosek (bez druku)',
]

interface PrintListItemWithVotes extends PrintListItem {
  votes?: ProcessVoteCount
}

interface Filters {
  search: string
  types: string[]
  categories: string[]
  typeFilter: string
  showAll: boolean
}

export default function ProcessSearchPage({
  prints = [],
}: {
  prints: PrintListItemWithVotes[]
}) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: [],
    categories: [],
    typeFilter: '',
    showAll: false,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const toggleArrayFilter = (key: 'types' | 'categories', item: string) =>
    updateFilter(
      key,
      filters[key].includes(item)
        ? filters[key].filter((x) => x !== item)
        : [...filters[key], item]
    )

  // Combined filters and sorting logic
  const processedPrints = useMemo(() => {
    const filterMap = new Map<
      string,
      { count: number; type: 'topic' | 'org' }
    >()

    prints.forEach((print) => {
      ;[...print.categories, ...print.organizations].forEach((item) => {
        const entry = filterMap.get(item) || {
          count: 0,
          type: print.categories.includes(item) ? 'topic' : 'org',
        }
        filterMap.set(item, { ...entry, count: entry.count + 1 })
      })
    })

    const availableFilters = Array.from(filterMap.entries())
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, ...data }))

    const searchableText = (print: PrintListItem) =>
      [print.title, print.short_title, print.processDescription, print.summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

    const filtered = prints.filter((print) => {
      const matchesSearch =
        !filters.search ||
        searchableText(print).includes(filters.search.toLowerCase())
      const matchesCategories =
        !filters.categories.length ||
        filters.categories.some((cat) =>
          [...print.categories, ...print.organizations].includes(cat)
        )
      const matchesTypes =
        !filters.types.length || filters.types.includes(print.type)
      return matchesSearch && matchesCategories && matchesTypes
    })

    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.date || '1900-01-01').getTime() -
        new Date(a.date || '1900-01-01').getTime()
    )

    return { availableFilters, sorted }
  }, [prints, filters])

  const { availableFilters, sorted: filteredPrints } = processedPrints
  const visibleFilters = filters.showAll
    ? availableFilters
    : availableFilters.slice(0, 4)
  const displayedPrints = filteredPrints.slice(0, currentPage * 10)
  const filteredTypes = DOCUMENT_TYPES.filter((type) =>
    type.toLowerCase().includes(filters.typeFilter.toLowerCase())
  )

  // Photo URLs memoization
  const photoUrls = useMemo(
    () =>
      Object.fromEntries(
        prints.map((print) => [
          print.number,
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/processes/${print.number}.jpg`,
        ])
      ),
    [prints]
  )

  // Author badges helper
  const getAuthorBadges = (print: PrintListItem) => {
    const badges = print.title.includes('Prezydium Sejmu')
      ? ['Prezydium Sejmu']
      : print.title.includes('Obywatelski')
        ? ['Obywatele']
        : print.authorClubs

    return badges.map((badge) => (
      <Badge key={badge} variant="default" className="bg-primary">
        {badge}
      </Badge>
    ))
  }

  // Reset page when filters change
  useEffect(
    () => setCurrentPage(1),
    [filters.search, filters.categories, filters.types]
  )

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 1000
      ) {
        setCurrentPage((prev) => prev + 1)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="container px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Input
            placeholder="Szukaj..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-8 h-8"
          />
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 justify-between border-dashed"
            >
              Typ dokumentu
              {filters.types.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span className="rounded-sm px-1 font-normal">
                    {filters.types.length}
                  </span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Szukaj typu..."
                value={filters.typeFilter}
                onChange={(e) => updateFilter('typeFilter', e.target.value)}
                className="mb-2"
              />
              <div className="max-h-[300px] overflow-y-auto">
                {filteredTypes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nie znaleziono typów
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleArrayFilter('types', type)}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-primary/20"
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                            filters.types.includes(type)
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50'
                          }`}
                        >
                          {filters.types.includes(type) && '✓'}
                        </div>
                        <span className="flex-grow text-left">{type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {visibleFilters.map((filter) => (
          <Button
            key={filter.name}
            variant={
              filters.categories.includes(filter.name) ? 'default' : 'outline'
            }
            size="sm"
            className={`h-8 ${filter.type === 'org' ? 'border-primary/30' : ''}`}
            onClick={() => toggleArrayFilter('categories', filter.name)}
          >
            {filter.name}
          </Button>
        ))}

        {!filters.showAll && availableFilters.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => updateFilter('showAll', true)}
          >
            +{availableFilters.length - 4} więcej
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {displayedPrints.map((print) => (
          <Card key={print.number} className="overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <div className="flex-1 p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-primary text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {print.type}
                  </span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(print.date).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex gap-1">{getAuthorBadges(print)}</div>
                </div>

                <Link
                  href={`/processes/${print.number}`}
                  className="block group-hover:opacity-80"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {print.short_title}
                  </h2>
                  <div className="prose-sm text-muted-foreground">
                    <ReactMarkdown>
                      {truncateText(print.summary || '', 200)}
                    </ReactMarkdown>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-4">
                  <PostVoting
                    pointId={parseInt(print.number)}
                    initialVotes={print.votes || { upvotes: 0, downvotes: 0 }}
                  />
                  <div className="flex items-center gap-2">
                    <span>{print.categories.join(', ')}</span>
                  </div>
                  {print.status && (
                    <Badge variant="outline" className="ml-auto">
                      {print.status}
                    </Badge>
                  )}
                </div>
              </div>

              <Link
                href={`/processes/${print.number}`}
                className="relative h-[200px] sm:h-auto sm:w-[300px]"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={photoUrls[print.number]}
                    alt={print.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                </div>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
