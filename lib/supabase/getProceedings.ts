import { createClient } from '@/utils/supabase/server'
import { getRandomPhoto } from '@/lib/utils/photos'
import { ProceedingPointWithDay, LatestPointsResult } from '@/lib/types/proceeding'

type ProceedingWithDays = {
  id: number
  number: number
  title: string
  dates: string[]
  proceeding_day: Array<{
    id: number
    date: string
    proceeding_point_ai: Array<{
      voting_numbers: number[]
      id: number
      topic: string
      summary_tldr: string
    }>
  }>
}

export async function getProceedings(): Promise<ProceedingWithDays[]> {
  const supabase = createClient()
  const { data } = await (
    await supabase
  )
    .from('proceeding')
    .select(
      `
      id,
      number,
      title,
      dates,
      proceeding_day!inner (
        id,
        date,
        proceeding_point_ai (
          id,
          topic,
          official_point,
          summary_tldr,
          voting_numbers
        )
      )
    `
    )
    .order('number', { ascending: false })

  return data || []
}

export async function getLatestProceedingPoints(): Promise<LatestPointsResult[]> {
  const supabase = createClient()
  const { data } = await (
    await supabase)
    .from('proceeding_point_ai')
    .select(`
      id,
      topic,
      summary_tldr,
      voting_numbers,
      proceeding_day!inner (
        date,
        proceeding!inner (
          number,
          title
        )
      )
    `)
    .order('id', { ascending: false })
    .limit(10) as { data: ProceedingPointWithDay[] | null }

  return data?.map(point => {
    const [category, title] = point.topic.split(' | ')
    return {
      category: category || "Punkt obrad",
      title: title || point.topic,
      description: point.summary_tldr || '', 
      likes: "0",
      comments: "0",
      interested: "0",
      imageUrl: getRandomPhoto(String(point.id || Math.random())),
      pointId: point.id,
      proceedingNumber: point.proceeding_day.proceeding.number,
      date: point.proceeding_day.date,
      votingNumbers: point.voting_numbers
    }
  }) || []
}
