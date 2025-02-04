import { createClient } from '@/utils/supabase/server'

type RelatedPoint = {
  id: number
  official_point: string
  proceeding_day: {
    proceeding_id: number
    date: string
  }
}

export async function getRelatedPoint(
  pointId: number,
  officialPoint: string,
  proceedingId: number
): Promise<RelatedPoint | null> {
  const supabase = createClient()
  const { data } = await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
      id,
      official_point,
      proceeding_day!inner (
        proceeding_id,
        date
      )
    `
    )
    .eq('official_point', officialPoint)
    .eq('proceeding_day.proceeding_id', proceedingId)
    .order('proceeding_day(date)', { ascending: true })
    .neq('id', pointId)
    .limit(1)
    .single()
  return data as unknown as RelatedPoint
}
