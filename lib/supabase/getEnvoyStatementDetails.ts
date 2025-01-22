import { createClient } from '@/utils/supabase/server'

export async function getEnvoyStatementDetails(name: string) {
  const supabase = createClient()

  const { data: statementData } = await (
    await supabase
  )
    .from('statement')
    .select(
      `
      id,
      speaker_name,
      speaker_function,
      number_sequence,
      official_point,
      official_topic,
      text
    `
    )
    .eq('speaker_name', name)
    .eq('speaker_name', name)

  return statementData || []
}
