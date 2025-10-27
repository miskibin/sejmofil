'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { TopicWithId } from '@/lib/queries/topic'
import { FileText, Grid3x3, List, Search } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface TopicsClientProps {
  topics: Array<TopicWithId & { printCount: number }>
}

const ITEMS_PER_PAGE = 20

type SortOption = 'default' | 'prints' | 'alphabetical'
type ViewMode = 'grid' | 'list'

export function TopicsClient({ topics }: TopicsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort logic
  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (topic) =>
          topic.name.toLowerCase().includes(query) ||
          topic.description?.toLowerCase().includes(query)
      )
    }

    // Sorting
    switch (sortBy) {
      case 'prints':
        result.sort((a, b) => b.printCount - a.printCount)
        break
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name, 'pl'))
        break
      case 'default':
      default:
        // Already sorted by print count from the query
        break
    }

    return result
  }, [topics, searchQuery, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTopics.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTopics = filteredAndSortedTopics.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  if (currentPage !== 1 && (searchQuery || sortBy !== 'default')) {
    if (startIndex >= filteredAndSortedTopics.length && currentPage > 1) {
      setCurrentPage(1)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Szukaj wśród ${topics.length} tematów dyskusyjnych...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Sortuj według:
            </span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Domyślnie</SelectItem>
                <SelectItem value="prints">Najwięcej druków</SelectItem>
                <SelectItem value="alphabetical">Alfabetycznie A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Widok:
            </span>
            <div className="flex gap-1 rounded-md border p-1">
              <Toggle
                pressed={viewMode === 'grid'}
                onPressedChange={() => setViewMode('grid')}
                variant="outline"
                size="sm"
                aria-label="Widok siatki"
              >
                <Grid3x3 className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={viewMode === 'list'}
                onPressedChange={() => setViewMode('list')}
                variant="outline"
                size="sm"
                aria-label="Widok listy"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {searchQuery
            ? `Wyniki wyszukiwania (${filteredAndSortedTopics.length})`
            : `Wszystkie tematy (${filteredAndSortedTopics.length})`}
        </h2>
      </div>

      {/* Topics Grid/List */}
      {currentTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-lg font-semibold">Brak wyników</h3>
          <p className="text-sm text-muted-foreground">
            Nie znaleziono tematów pasujących do wyszukiwania &quot;
            {searchQuery}&quot;
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentTopics.map((topic) => (
            <Link
              key={topic.name}
              href={`/topics/${encodeURIComponent(topic.name)}`}
            >
              <CardWrapper className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
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
                    <span>
                      {topic.printCount}{' '}
                      {topic.printCount === 1 ? 'druk' : 'druków'}
                    </span>
                  </div>
                </div>
              </CardWrapper>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {currentTopics.map((topic) => (
            <Link
              key={topic.name}
              href={`/topics/${encodeURIComponent(topic.name)}`}
            >
              <div className="group flex items-center justify-between gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {topic.printCount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {topic.printCount === 1 ? 'druk' : 'druków'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, idx) => (
              <PaginationItem key={idx}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
