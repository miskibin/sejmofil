import { createClient } from '@/utils/supabase/server'

type ProceedingDayDetails = {
  id: number
  date: string
  proceeding: {
    id: number
    number: number
    title: string
  }
  proceeding_point_ai: Array<{
    id: number
    topic: string
    summary_tldr: string
    voting_numbers: number[]
    print_numbers: number[]
    statements: Array<{
      statement: {
        id: number
        speaker_name: string
        statement_ai?: {
          speaker_rating?: Record<string, number>
          citations?: string[]
          summary_tldr?: string
        }
      }
    }>
  }>
}

export async function getProceedingDayDetails(
  number: number,
  date: string
): Promise<ProceedingDayDetails> {
  const supabase = createClient()
  const { data } = await (
    await supabase
  )
    .from('proceeding_day')
    .select(
      `
      id,
      date,
      proceeding (
        id,
        number,
        title
      ),
      proceeding_point_ai (
        id,
        topic,
        summary_tldr,
        voting_numbers,
        print_numbers,
        statements:statement_to_point (
          statement:statement_id (
            id,
            speaker_name,
            statement_ai (
              speaker_rating,
              citations,
              summary_tldr
            )
          )
        )
      )
    `
    )
    .eq('proceeding.number', number)
    .eq('date', date)
    .single()

  return data as unknown as ProceedingDayDetails
}
