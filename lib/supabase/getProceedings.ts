import { createClient } from '@/utils/supabase/server'
import { getRandomPhoto } from '@/lib/utils/photos'
import {
  ProceedingPointWithDay,
  LatestPointsResult,
} from '@/lib/types/proceeding'
import { Tables } from '@/utils/supabase/supabase'

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

type VoteCount = {
  point_id: number
  upvotes: number
  downvotes: number
}

type ProceedingDayPoint = {
  id: number
  topic: string
  summary_tldr: string | null
  voting_numbers: number[]
  proceeding_day: {
    date: string
    proceeding: {
      number: number
      title: string
    }
  }
}

export async function getProceedings(): Promise<ProceedingWithDays[]> {
  const supabase = createClient()
  const { data, error } = await (
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

  if (error) {
    console.error('Error fetching proceedings:', error)
    return []
  }

  return data || []
}

export async function getLatestProceedingPoints(
  category?: string
): Promise<LatestPointsResult[]> {
  const supabase = createClient()

  const { data: voteCounts, error: voteError } = (await (
    await supabase
  ).rpc('get_all_vote_counts')) as { data: VoteCount[]; error: any }
  if (voteError) {
    console.error('Error fetching vote counts:', voteError)
  }

  const votesByPointId = (voteCounts || []).reduce<
    Record<number, { upvotes: number; downvotes: number }>
  >((acc, vote) => {
    acc[vote.point_id] = { upvotes: vote.upvotes, downvotes: vote.downvotes }
    return acc
  }, {})

  let query = (await supabase).from('proceeding_point_ai').select(
    `
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
    `
  )

  if (category) {
    query = query.ilike('topic', `${category}%`)
  }

  const { data, error } = (await query.limit(500)) as {
    data: ProceedingDayPoint[] | null
    error: any
  }

  if (error) {
    console.error('Error fetching proceeding points:', error)
    return []
  }

  // Sort by date descending (newest first), then by id descending
  const sortedData = (data || [])
    .sort((a, b) => {
      const dateA = new Date(a.proceeding_day.date).getTime()
      const dateB = new Date(b.proceeding_day.date).getTime()
      if (dateB !== dateA) {
        return dateB - dateA
      }
      return b.id - a.id
    })
    .slice(0, 200) // Take top 200 after sorting

  return (
    sortedData?.map((point) => {
      const [pointCategory, title] = point.topic.split(' | ')
      const votes = votesByPointId[point.id] || { upvotes: 0, downvotes: 0 }
      return {
        category: pointCategory || 'Punkt obrad',
        title: title || point.topic,
        description: point.summary_tldr || '',
        likes: String(votes.upvotes - votes.downvotes),
        comments: '0',
        interested: '0',
        imageUrl: getRandomPhoto(String(point.id || Math.random())),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers,
        votes: votes,
      }
    }) || []
  )
}

export async function getPopularProceedingPoints(): Promise<
  LatestPointsResult[]
> {
  const supabase = createClient()

  const { data: voteCounts, error: voteError } = (await (
    await supabase
  ).rpc('get_all_vote_counts')) as { data: VoteCount[]; error: any }
  if (voteError) {
    console.error('Error fetching vote counts for popular points:', voteError)
  }

  const votesByPointId = (voteCounts || []).reduce<
    Record<
      number,
      { score: number; votes: { upvotes: number; downvotes: number } }
    >
  >((acc, vote) => {
    acc[vote.point_id] = {
      score: Number(vote.upvotes) - Number(vote.downvotes),
      votes: {
        upvotes: Number(vote.upvotes),
        downvotes: Number(vote.downvotes),
      },
    }
    return acc
  }, {})

  const { data: points, error } = (await (
    await supabase
  )
    .from('proceeding_point_ai')
    .select(
      `
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
    `
    )
    .limit(500)) as { data: ProceedingDayPoint[] | null; error: any }

  if (error) {
    console.error('Error fetching popular proceeding points:', error)
    return []
  }

  // Sort by popularity (vote score) first, then by date for items with same score
  const sortedPoints = (points || [])
    .sort((a, b) => {
      const scoreA = votesByPointId[a.id]?.score || 0
      const scoreB = votesByPointId[b.id]?.score || 0

      // Sort by score descending
      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }

      // For items with same score, sort by date (newest first)
      const dateA = new Date(a.proceeding_day.date).getTime()
      const dateB = new Date(b.proceeding_day.date).getTime()
      return dateB - dateA
    })
    .slice(0, 200) // Take top 200 after sorting
    .map((point) => {
      const [category, title] = point.topic.split(' | ')
      const voteData = votesByPointId[point.id] || {
        score: 0,
        votes: { upvotes: 0, downvotes: 0 },
      }
      return {
        category: category || 'Punkt obrad',
        title: title || point.topic,
        description: point.summary_tldr || '',
        likes: String(voteData.score),
        comments: '0',
        interested: '0',
        imageUrl: getRandomPhoto(String(point.id || Math.random())),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers,
        votes: voteData.votes,
      }
    })

  return sortedPoints
}

export async function getAllCategories(): Promise<string[]> {
  const supabase = createClient()

  // Optimize by only fetching distinct topics with limit instead of all records
  const { data, error } = await (await supabase)
    .from('proceeding_point_ai')
    .select('topic')
    .not('topic', 'is', null)
    .limit(1000) // Limit to recent records for better performance

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Count occurrences of each category
  const categoryCount: Record<string, number> = {}
  data?.forEach((point: any) => {
    const category = point.topic?.split(' | ')[0]
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
