import { createClient } from '@/utils/supabase/server'
import { SummaryMain } from '../types/proceeding'

type PointWithStatements = {
  id: number
  topic: string
  official_point: string
  official_topic: string
  summary_main: SummaryMain
  summary_tldr: string
  voting_numbers: number[]
  print_numbers: number[]
  proceeding_day: {
    date: string
    proceeding: {
      number: number
    }
  }
  statements: {
    id: number
    speaker_name: string
    text: string
    number_source: number
    number_sequence: number
    statement_ai: {
      summary_tldr: string
      yt_sec: string
      citations: string[]
      topic_attitude: Record<string, number>
      speaker_rating: Record<string, number>
    }
  }[]
}

export async function getPointDetails(
  id: number,
  showAllStatements = false
): Promise<PointWithStatements> {
  const supabase = createClient()
  const { data, error } = await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
      id,
      topic,
      official_point,
      official_topic,
      summary_main,
      summary_tldr,
      print_numbers,
      voting_numbers,
            proceeding_day (
        date,
        proceeding (
          number
        )
      ),
      statements:statement_to_point!proceeding_point_ai_id(
        statement:statement_id(
          id,
          speaker_name,
          text,
          number_sequence,
          number_source,
          statement_ai (
            summary_tldr,
            yt_sec,
            citations,
            topic_attitude,
            speaker_rating
          )
        )
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching point details:', error)
    throw new Error(`Failed to fetch point details: ${error.message}`)
  }

  if (!data) {
    throw new Error('Point not found')
  }
  const transformedData = {
    ...(data as any),
    // summary_main: JSON.parse(data?.summary_main || "{}"),
    statements:
      (data as any)?.statements
        ?.map((item: { statement: any }) => item.statement)
        ?.filter((statement: any) =>
          showAllStatements ? true : statement?.number_source !== 0
        ) || [],
  }
  return transformedData as unknown as PointWithStatements
}
