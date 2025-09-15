import { createClient } from '@/utils/supabase/server'

type SearchPointResult = {
  id: number
  topic: string
  summary_tldr: string
  proceeding_day: {
    date: string
    proceeding: {
      number: number
    }
  }
}
// TODO TODO TODO ADD ORDERING BY using ts_rank_cd
export async function searchPoints(
  query: string
): Promise<SearchPointResult[]> {
  const supabase = createClient()

  // Convert multiple words into a format that PostgreSQL full-text search can understand
  const formattedQuery = query
    .trim()
    .split(/\s+/)
    .map((word) => word + ':*')
    .join(' & ')

  const { data, error } = await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
    id,
    topic,
    summary_tldr,
    proceeding_day!inner (
      date,
      proceeding!inner (
        number
      )
    )
    `
    )
    .textSearch('search_tsv', formattedQuery, {
      config: 'pl_ispell',
    })
    .limit(20)

  if (error) {
    console.error('Error searching points:', error)
    return []
  }

  return (data as unknown as SearchPointResult[]) || []
}
