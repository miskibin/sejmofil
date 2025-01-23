import { createClient } from '@/utils/supabase/server'

interface PrintRelatedPoint {
  id: number
  topic: string
  summary_tldr: string
  proceeding_day: {
    date: string
    proceeding: {
      number: number
    }
  }
  print_numbers: number[]
}
export async function getPointsByPrintNumbers(
  printNumbers: string[]
): Promise<PrintRelatedPoint[]> {
  const supabase = createClient()
  const { data } = await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
        id,
        topic,
        summary_tldr,
        print_numbers,
        proceeding_day!inner (
          date,
          proceeding!inner (
            number
          )
        )
      `
    )
    .overlaps('print_numbers', printNumbers)
    .order('id', { ascending: false })
  return (data as unknown as PrintRelatedPoint[]) || []
}
