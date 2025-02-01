'use server'

import { unstable_cache } from 'next/cache'
import { getAllProcessPrints } from '../queries/print'

export const fetchPaginatedPrints = unstable_cache(
  async (
    page: number = 0,
    filters?: {
      dateFrom?: string
      dateTo?: string
      categories?: string[]
      documentTypes?: string[]
      status?: string
    }
  ) => {
    // Create a cache key that includes the filters
    const cacheKey = `prints-${page}-${JSON.stringify(filters)}`
    console.log('Server: Cache key:', cacheKey)
    
    const results = await getAllProcessPrints(page * 20, 20, {
      ...filters,
      categories: filters?.categories?.filter(c => c !== 'wszystkie')
    })
    return results
  },
  ['prints'],
  {
    revalidate: 3600,
    tags: ['prints']
  }
)
