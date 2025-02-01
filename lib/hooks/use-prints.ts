import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPaginatedPrints } from '../actions/prints'
import { useState, useMemo, useEffect } from 'react'
import { PrintListItem } from '../types/print'
import { getRandomPhoto } from '../utils/photos'
import { DocumentType } from '../constants'

export interface PrintsFilters {
  selectedCategory: string
  selectedTypes: DocumentType[]
  dateFrom?: Date // TO DO - use this
  dateTo?: Date
}

export function usePrints(
  initialPrints: PrintListItem[],
  initialTopics: { name: string; count: number }[]
) {
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [filters, setFilters] = useState<PrintsFilters>({
    selectedTypes: [],
    selectedCategory: 'wszystkie',
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching, refetch } =
    useInfiniteQuery({
      queryKey: ['prints', filters],
      queryFn: async ({ pageParam = 0 }) => {
        console.log('Fetching with filters:', filters)
        const data = await fetchPaginatedPrints(pageParam, {
          dateFrom: filters.dateFrom?.toISOString(),
          dateTo: filters.dateTo?.toISOString(),
          categories:
            filters.selectedCategory !== 'wszystkie'
              ? [filters.selectedCategory]
              : undefined,
          documentTypes:
            filters.selectedTypes.length > 0
              ? filters.selectedTypes
              : undefined,
        })

        return data
      },
      getNextPageParam: (lastPage, allPages) => {
        const hasMore = lastPage.length >= 20
        return hasMore ? allPages.length : undefined
      },
      initialData: { pages: [initialPrints], pageParams: [0] },
      initialPageParam: 0,
    })

  // Reset pagination when filters change
  useEffect(() => {
    refetch()
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.selectedCategory,
    filters.selectedTypes,
  ])

  return {
    prints: data?.pages.flat() ?? [],
    photoUrls: useMemo(
      () =>
        Object.fromEntries(
          data?.pages
            .flat()
            .map((print) => [print.number, getRandomPhoto(print.number)]) ?? []
        ),
      [data?.pages]
    ),
    filters,
    setFilters,
    isExpanded,
    setIsExpanded,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    showAllTopics,
    setShowAllTopics,
    commonTopics: showAllTopics ? initialTopics : initialTopics.slice(0, 4),
    hiddenCount: !showAllTopics ? initialTopics.length - 4 : 0,
  }
}
