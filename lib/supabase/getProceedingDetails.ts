import { createClient } from '@/utils/supabase/server'

type ProceedingWithDetails = {
  id: number
  number: number
  title: string
  dates: string[]
  proceeding_day: Array<{
    id: number
    date: string
    proceeding_point_ai: Array<{
      id: number
      topic: string
      summary_tldr: string
      voting_numbers: number[]
      statements: Array<{
        id: number
        speaker_name: string
        statement_ai?: {
          speaker_rating?: Record<string, number>
        }
      }>
    }>
  }>
}

export async function getProceedingDetails(
  number: number
): Promise<ProceedingWithDetails> {
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
          summary_tldr,
          voting_numbers,
          statements:statement_to_point!proceeding_point_ai_id (
            statement:statement_id (
              id,
              speaker_name,
              statement_ai (
                speaker_rating
              )
            )
          )
        )
      )
    `
    )
    .eq('number', number)
    .single()

  return data as unknown as ProceedingWithDetails
}
