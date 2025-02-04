'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PrintListItem } from '@/lib/types/print'
import { getRandomPhoto } from '@/lib/utils/photos'
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

const ITEMS_PER_PAGE = 10

type FilterType = 'topics' | 'organizations' | 'types'

export default function ProcessSearchPage({
  prints = [],
}: {
  prints: PrintListItem[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')

  const filters = useMemo(() => {
    const countMap = new Map<string, { count: number; type: 'topic' | 'org' }>()

    prints.forEach((print) => {
      print.categories?.forEach((cat) => {
        countMap.set(cat, {
          count: (countMap.get(cat)?.count || 0) + 1,
          type: 'topic',
        })
      })
      print.organizations?.forEach((org: string) => {
        countMap.set(org, {
          count: (countMap.get(org)?.count || 0) + 1,
          type: 'org',
        })
      })
    })

    return Array.from(countMap.entries())
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, ...data }))
  }, [prints])

  const visibleFilters = showAllFilters ? filters : filters.slice(0, 4)

  const filteredTypes = DOCUMENT_TYPES.filter((type) =>
    type.toLowerCase().includes(typeFilter.toLowerCase())
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategories, selectedTypes])

  const filteredPrints = prints.filter((print) => {
    const searchableText = [
      print.title,
      print.short_title,
      print.processDescription,
      print.summary,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchTerm
      ? searchableText.includes(searchTerm.toLowerCase())
      : true

    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.some((selected) => {
        // Check if the selected item exists in either categories or organizations
        return (
          print.categories.includes(selected) ||
          print.organizations.includes(selected)
        )
      })

    const matchesTypes =
      selectedTypes.length === 0 || selectedTypes.includes(print.type)

    return matchesSearch && matchesCategories && matchesTypes
  })

  const photoUrls = useMemo(() => {
    return prints.reduce(
      (acc, print) => {
        acc[print.number] = getRandomPhoto(print.number)
        return acc
      },
      {} as Record<string, string>
    )
  }, [prints])

  const displayedPrints = filteredPrints.slice(0, currentPage * ITEMS_PER_PAGE)

  // Intersection Observer for infinite scroll
  const onScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 1000
    ) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const getAuthorBadges = (print: PrintListItem) => {
    if (print.title.includes('Prezydium Sejmu')) {
      return [<Badge key="prezydium" variant="default" className="bg-primary">Prezydium Sejmu</Badge>]
    }
    
    if (print.title.includes('Obywatelski')) {
      return [<Badge key="obywatele" variant="default" className="bg-primary">Obywatele</Badge>]
    }

    return print.authorClubs.map((clubId) => (
      <Badge key={clubId} variant="default" className="bg-primary">
        {clubId}
      </Badge>
    ))
  }

  return (
    <div className="container px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8"
          />
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 justify-between border-dashed">
              Typ dokumentu
              {selectedTypes.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span className="rounded-sm  px-1 font-normal">
                    {selectedTypes.length}
                  </span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Szukaj typu..."
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                        onClick={() => {
                          setSelectedTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((t) => t !== type)
                              : [...prev, type]
                          )
                        }}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-primary/20"
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                            selectedTypes.includes(type)
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50'
                          }`}
                        >
                          {selectedTypes.includes(type) && '✓'}
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
              selectedCategories.includes(filter.name) ? 'default' : 'outline'
            }
            size="sm"
            className={`h-8 ${filter.type === 'org' ? 'border-primary/30' : ''}`}
            onClick={() =>
              setSelectedCategories((prev) =>
                prev.includes(filter.name)
                  ? prev.filter((c) => c !== filter.name)
                  : [...prev, filter.name]
              )
            }
          >
            {filter.name}
          </Button>
        ))}

        {!showAllFilters && filters.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowAllFilters(true)}
          >
            +{filters.length - 4} więcej
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {displayedPrints.map((print) => (
          <Link
            key={print.number}
            href={`/processes/${print.number}`}
            className="block transition-opacity hover:opacity-90"
          >
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <div className="flex-1 p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{print.short_title}</h2>
                      <div className="flex gap-1">
                        {getAuthorBadges(print)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {print.processDescription || print.title}
                    </p>
                  </div>
                  <div className="prose-sm">
                    <ReactMarkdown>
                      {truncateText(print.summary || '', 500)}
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
      </div>
    </div>
  )
}
