import { createClient } from '@/utils/supabase/server'

export interface ProceedingPointForTopic {
  id: number
  topic: string
  summary_tldr: string
  print_numbers: number[]
  voting_numbers: number[]
  proceeding_day: {
    date: string
    proceeding: {
      number: number
      title: string
    }
  }
}

/**
 * Get proceeding points related to a topic through print numbers
 */
export async function getProceedingPointsByPrintNumbers(
  printNumbers: string[],
  limit: number = 20
): Promise<ProceedingPointForTopic[]> {
  if (printNumbers.length === 0) {
    return []
  }

  const supabase = createClient()
  const { data, error } = await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
      id,
      topic,
      summary_tldr,
      print_numbers,
      voting_numbers,
      proceeding_day (
        date,
        proceeding (
          number,
          title
        )
      )
    `
    )
    .not('print_numbers', 'is', null)
    .order('proceeding_day(date)', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching proceeding points:', error)
    return []
  }

  if (!data) return []

  // Filter points that have any of the print numbers
  const filtered = data.filter((point: any) => {
    if (!point.print_numbers) return false
    const printNumsAsStrings = printNumbers.map(String)
    return point.print_numbers.some((pn: number) =>
      printNumsAsStrings.includes(String(pn))
    )
  })

  return filtered as ProceedingPointForTopic[]
}
