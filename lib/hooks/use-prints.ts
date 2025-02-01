import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPaginatedPrints } from '../actions/prints'
import { useState, useEffect, useMemo } from 'react'
import { PrintListItem } from '../types/print'
import { getRandomPhoto } from '../utils/photos'

export interface PrintsFilters {
  dateFrom?: Date
  dateTo?: Date
  categories: string[]
  selectedCategory: string
  selectedTypes: string[] // This is what we're using for document types
  searchTerm?: string
}

export function usePrints(
  initialPrints: PrintListItem[],
  initialTopics: { name: string; count: number }[]
) {
  const [filters, setFilters] = useState<PrintsFilters>({
    categories: ['wszystkie', ...initialTopics.map(t => t.name)],
    selectedCategory: 'wszystkie',
    selectedTypes: [],
  })

  const query = useInfiniteQuery({
    queryKey: ['prints', filters],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching page:', pageParam)
      const apiFilters = {
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        categories: filters.selectedCategory !== 'wszystkie' ? [filters.selectedCategory] : undefined,
        documentTypes: filters.selectedTypes,
      }
      console.log('API Filters:', apiFilters)
      const data = await fetchPaginatedPrints(pageParam, apiFilters)
      console.log(`Received ${data.length} items`)
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.length >= 20
      console.log('Next page check:', { currentPages: allPages.length, hasMore })
      return hasMore ? allPages.length : undefined
    },
    defaultPageParam: 0,
    initialData: { pages: [initialPrints], pageParams: [0] },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
  })

  // Reset query when filters change
  useEffect(() => {
    query.refetch()
  }, [filters])

  const allPrints = useMemo(() => {
    const prints = query.data?.pages.flat() ?? []
    if (!filters.searchTerm) return prints

    const searchLower = filters.searchTerm.toLowerCase()
    return prints.filter(print => 
      print.title.toLowerCase().includes(searchLower)
    )
  }, [query.data?.pages, filters.searchTerm])

  return {
    prints: allPrints,
    photoUrls: useMemo(() => {
      const urls: Record<string, string> = {}
      allPrints.forEach(print => {
        if (!urls[print.number]) {
          urls[print.number] = getRandomPhoto(print.number)
        }
      })
      return urls
    }, [allPrints]),
    filters,
    setFilters,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
