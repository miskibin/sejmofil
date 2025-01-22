import { createClient } from '@/utils/supabase/server'

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
