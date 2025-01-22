import { createClient } from '@/utils/supabase/server'

type AdjacentPoint = {
  id: number
  proceeding_day: {
    date: string
  }
}
type AdjacentPointsResponse = {
  prev: AdjacentPoint | null
  next: AdjacentPoint | null
}

export async function getAdjacentPoints(
  pointId: number,
  proceedingId: number
): Promise<AdjacentPointsResponse> {
  const supabase = createClient()

  const { data: currentPoint } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, proceeding_day!inner(proceeding_id, date)')
    .eq('id', pointId)
    .single()

  if (!currentPoint) return { prev: null, next: null }

  const { data: prevPoint } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, proceeding_day!inner(date)')
    .eq('proceeding_day.proceeding_id', proceedingId)
    .lt('id', pointId)
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const { data: nextPoint } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, proceeding_day!inner(date)')
    .eq('proceeding_day.proceeding_id', proceedingId)
    .gt('id', pointId)
    .order('id', { ascending: true })
    .limit(1)
    .single()

  return {
    prev: (prevPoint as unknown as AdjacentPoint) || null,
    next: (nextPoint as unknown as AdjacentPoint) || null,
  }
}
