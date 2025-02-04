import { createClient } from '@/utils/supabase/server'
import { StatementCombined } from '../types/statement'

export async function getStatementCombinedDetails(
  name: string
): Promise<StatementCombined[]> {
  const supabase = createClient()

  const { data } = await (
    await supabase
  )
    .from('statement')
    .select(
      `
        id,
        number_sequence,
        official_topic,
        statement_ai (
          summary_tldr,
          citations,
          speaker_rating
        )
      `
    )
    .eq('speaker_name', name)
    .not('number_source', 'eq', 0)

  if (!data) return []
  return data as unknown as StatementCombined[]
}
