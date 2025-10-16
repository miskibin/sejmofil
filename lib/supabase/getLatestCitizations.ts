import { createClient } from '@/utils/supabase/server'

type CitationWithPerson = {
  speaker_name: string
  citation: string
  statement_id: number
}

export async function getLatestCitizations(
  number: number
): Promise<CitationWithPerson[]> {
  const supabase = createClient()

  const { data, error } = await (
    await supabase
  )
    .from('statement')
    .select(
      `
      id,
      speaker_name,
      statement_ai!inner (
        citations
      )
    `
    )
    .not('statement_ai.citations', 'is', null)
    .not('statement_ai.citations', 'eq', '{}')
    .order('id', { ascending: false })
    .limit(number)

  if (error) {
    console.error('Error fetching latest citations:', error)
    return []
  }

  if (!data) return []

  // Process and flatten citations, keeping only unique speakers
  const uniqueSpeakers = new Set<string>()
  const citations: CitationWithPerson[] = []

  data.forEach((item: any) => {
    if (uniqueSpeakers.has(item.speaker_name)) return

    const citation = (item.statement_ai as unknown as { citations: string[] })
      .citations[0]
    if (!citation) return

    uniqueSpeakers.add(item.speaker_name)
    citations.push({
      speaker_name: item.speaker_name,
      citation,
      statement_id: item.id,
    })
  })
  return citations.slice(0, 4) // Return only top 4 unique citations
}
