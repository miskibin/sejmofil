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

export async function getLatestProceedingPoints(category?: string): Promise<LatestPointsResult[]> {
  const supabase = createClient()
  let query = (await supabase)
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

  if (category) {
    query = query.ilike('topic', `${category}%`)
  }

  // Changed limit from 10 to 200 for client-side infinite scroll
  const { data } = await query.limit(200) as { data: ProceedingPointWithDay[] | null }

  return data?.map(point => {
    const [pointCategory, title] = point.topic.split(' | ')
    return {
      category: pointCategory || "Punkt obrad",
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

export async function getPopularProceedingPoints(): Promise<LatestPointsResult[]> {
  const supabase = createClient()
  
  // First, get the vote counts for all points
  const { data: voteCounts } = await (await supabase)
    .from('votes')
    .select('point_id, vote_type')
    
  // Calculate total votes per point
  const pointVotes = voteCounts?.reduce((acc, vote) => {
    if (!acc[vote.point_id]) {
      acc[vote.point_id] = 0
    }
    acc[vote.point_id] += vote.vote_type === 'up' ? 1 : -1
    return acc
  }, {} as Record<number, number>) || {}

  // Get proceeding points with their details
      // Changed limit from 20 to 200 for proceeding points query
  const { data: points } = await (await supabase)
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
    .limit(200) as { data: ProceedingPointWithDay[] | null }

  // Sort points by vote count and map to required format
  // Changed slice from 10 to returning all points for client-side pagination
  const sortedPoints = (points || [])
    .sort((a, b) => (pointVotes[b.id] || 0) - (pointVotes[a.id] || 0))
    .map(point => {
      const [category, title] = point.topic.split(' | ')
      return {
        category: category || "Punkt obrad",
        title: title || point.topic,
        description: point.summary_tldr || '',
        likes: String(pointVotes[point.id] || 0),
        comments: "0",
        interested: "0",
        imageUrl: getRandomPhoto(String(point.id || Math.random())),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers
      }
    })

  return sortedPoints
}

export async function getAllCategories(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await (await supabase)
    .from('proceeding_point_ai')
    .select('topic')
    
  // Count occurrences of each category
  const categoryCount: Record<string, number> = {}
  data?.forEach(point => {  
    const category = point.topic.split(' | ')[0]
    if (category) {
      categoryCount[category] = (categoryCount[category] || 0) + 1
    }
  })
  
  // Sort categories by count and take top 5
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)
}
