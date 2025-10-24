import { createClient } from '@/utils/supabase/server'

type AdjacentPoint = {
  id: number
  topic: string
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

  // First, get the current point's proceeding_day_id
  const { data: currentPoint } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, proceeding_day_id')
    .eq('id', pointId)
    .single()

  if (!currentPoint) return { prev: null, next: null }

  // Get all proceeding_day IDs for this proceeding
  const { data: proceedingDays } = await (await supabase)
    .from('proceeding_day')
    .select('id')
    .eq('proceeding_id', proceedingId)

  const proceedingDayIds = proceedingDays?.map(d => d.id) || []

  console.log('=== DATABASE DEBUG ===')
  console.log('Current point ID:', pointId)
  console.log('Proceeding ID:', proceedingId)
  console.log('Proceeding day IDs:', proceedingDayIds)
  console.log('Current proceeding_day_id:', currentPoint.proceeding_day_id)

  if (proceedingDayIds.length === 0) {
    console.log('No proceeding days found!')
    return { prev: null, next: null }
  }

  // Query prev/next using proceeding_day_id IN array
  const { data: prevPoint, error: prevError } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, topic, proceeding_day!inner(date)')
    .in('proceeding_day_id', proceedingDayIds)
    .lt('id', pointId)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: nextPoint, error: nextError } = await (await supabase)
    .from('proceeding_point_ai')
    .select('id, topic, proceeding_day!inner(date)')
    .in('proceeding_day_id', proceedingDayIds)
    .gt('id', pointId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  console.log('Prev point:', prevPoint, 'Error:', prevError)
  console.log('Next point:', nextPoint, 'Error:', nextError)
  console.log('=====================')

  return {
    prev: prevPoint ? (prevPoint as unknown as AdjacentPoint) : null,
    next: nextPoint ? (nextPoint as unknown as AdjacentPoint) : null,
  }
}
