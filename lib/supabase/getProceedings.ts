import { createClient } from '@/utils/supabase/server'
import { getRandomPhoto } from '@/lib/utils/photos'
import { LatestPointsResult } from '@/lib/types/proceeding'
import { cache } from 'react'

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
  official_point: string | null
  statements?: { statement: { id: number } }[]
  proceeding_day: {
    date: string
    proceeding: {
      number: number
      title: string
    }
  }
}

export const getLatestProceedingPoints = cache(async (category?: string): Promise<LatestPointsResult[]> => {
  const supabase = await createClient()

  const [voteCountsRes, pointsRes] = await Promise.all([
    supabase.rpc('get_all_vote_counts'),
    supabase
      .from('proceeding_point_ai')
      .select(`
        id, 
        topic, 
        summary_tldr, 
        voting_numbers, 
        official_point,
        proceeding_day!inner (
          date,
          proceeding!inner (number, title)
        ),
        statements:statement_to_point!proceeding_point_ai_id(
          statement:statement_id(id)
        )
      `)
      .order('id', { ascending: false })
      .ilike('topic', category ? `${category}%` : '%')
      .limit(1000),
  ])

  if (pointsRes.error) {
    console.error('Error fetching proceeding points:', pointsRes.error)
    return []
  }

  const voteCounts = (voteCountsRes.data || []) as VoteCount[]
  const data = (pointsRes.data || []) as ProceedingDayPoint[]

  const votesByPointId = voteCounts.reduce(
    (acc, vote) => ({ ...acc, [vote.point_id]: { upvotes: vote.upvotes, downvotes: vote.downvotes } }),
    {} as Record<number, { upvotes: number; downvotes: number }>
  )

  return data
    .filter(point => {
      // For "foryou" (no category), filter out "Oświadczenia poselskie"
      if (!category) {
        const pointCategory = point.topic?.split(' | ')[0]?.toLowerCase()
        return pointCategory !== 'oświadczenia poselskie'
      }
      return true
    })
    .sort((a, b) => {
      const diff = new Date(b.proceeding_day.date).getTime() - new Date(a.proceeding_day.date).getTime()
      return diff !== 0 ? diff : b.id - a.id
    })
    .slice(0, 200)
    .map((point) => {
      const [category, title] = point.topic?.split(' | ') || []
      const votes = votesByPointId[point.id] || { upvotes: 0, downvotes: 0 }
      const statementsCount = point.statements?.length || 0
      return {
        category: category || 'Punkt obrad',
        title: title || point.topic || 'Bez tytułu',
        description: point.summary_tldr || '',
        likes: String(votes.upvotes - votes.downvotes),
        comments: '0',
        interested: '0',
        imageUrl: getRandomPhoto(String(point.id)),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers,
        officialPoint: point.official_point || null,
        votes,
        statementsCount,
      }
    })
})

export const getPopularProceedingPoints = cache(async (): Promise<LatestPointsResult[]> => {
  const supabase = await createClient()

  const [voteCountsRes, pointsRes] = await Promise.all([
    supabase.rpc('get_all_vote_counts'),
    supabase
      .from('proceeding_point_ai')
      .select(`
        id, 
        topic, 
        summary_tldr, 
        voting_numbers, 
        official_point,
        proceeding_day!inner (
          date,
          proceeding!inner (number, title)
        ),
        statements:statement_to_point!proceeding_point_ai_id(
          statement:statement_id(id)
        )
      `)
      .order('id', { ascending: false })
      .limit(1000),
  ])

  if (pointsRes.error) {
    console.error('Error fetching popular proceeding points:', pointsRes.error)
    return []
  }

  const voteCounts = (voteCountsRes.data || []) as VoteCount[]
  const points = (pointsRes.data || []) as ProceedingDayPoint[]

  const votesByPointId = voteCounts.reduce(
    (acc, vote) => ({
      ...acc,
      [vote.point_id]: {
        score: Number(vote.upvotes) - Number(vote.downvotes),
        votes: { upvotes: Number(vote.upvotes), downvotes: Number(vote.downvotes) },
      },
    }),
    {} as Record<number, { score: number; votes: { upvotes: number; downvotes: number } }>
  )

  return points
    .sort((a, b) => {
      const scoreA = votesByPointId[a.id]?.score || 0
      const scoreB = votesByPointId[b.id]?.score || 0
      if (scoreB !== scoreA) return scoreB - scoreA
      return new Date(b.proceeding_day.date).getTime() - new Date(a.proceeding_day.date).getTime()
    })
    .slice(0, 200)
    .map((point) => {
      const [category, title] = point.topic?.split(' | ') || []
      const voteData = votesByPointId[point.id] || {
        score: 0,
        votes: { upvotes: 0, downvotes: 0 },
      }
      const statementsCount = point.statements?.length || 0
      return {
        category: category || 'Punkt obrad',
        title: title || point.topic || 'Bez tytułu',
        description: point.summary_tldr || '',
        likes: String(voteData.score),
        comments: '0',
        interested: '0',
        imageUrl: getRandomPhoto(String(point.id)),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers,
        officialPoint: point.official_point || null,
        votes: voteData.votes,
        statementsCount,
      }
    })
})

export const getForYouProceedingPoints = cache(async (): Promise<LatestPointsResult[]> => {
  const supabase = await createClient()

  const [voteCountsRes, pointsRes] = await Promise.all([
    supabase.rpc('get_all_vote_counts'),
    supabase
      .from('proceeding_point_ai')
      .select(`
        id, 
        topic, 
        summary_tldr, 
        voting_numbers, 
        official_point,
        proceeding_day!inner (
          date,
          proceeding!inner (number, title)
        ),
        statements:statement_to_point!proceeding_point_ai_id(
          statement:statement_id(id)
        )
      `)
      .order('id', { ascending: false })
      .limit(1000),
  ])

  if (pointsRes.error) {
    console.error('Error fetching for you proceeding points:', pointsRes.error)
    return []
  }

  const voteCounts = (voteCountsRes.data || []) as VoteCount[]
  const points = (pointsRes.data || []) as ProceedingDayPoint[]

  const votesByPointId = voteCounts.reduce(
    (acc, vote) => ({
      ...acc,
      [vote.point_id]: {
        sumOfVotes: Number(vote.upvotes) + Number(vote.downvotes),
        votes: { upvotes: Number(vote.upvotes), downvotes: Number(vote.downvotes) },
      },
    }),
    {} as Record<number, { sumOfVotes: number; votes: { upvotes: number; downvotes: number } }>
  )

  const now = new Date()
  
  return points
    .filter(point => {
      // Filter out "Oświadczenia poselskie"
      const pointCategory = point.topic?.split(' | ')[0]?.toLowerCase()
      return pointCategory !== 'oświadczenia poselskie'
    })
    .sort((a, b) => {
      // Algorithm: 10 * (votings > 0) + 20 * min(statements, 100) + sum_of_votes - days_passed
      const calcScore = (point: ProceedingDayPoint) => {
        const votingCount = point.voting_numbers?.length || 0
        const statementsCount = point.statements?.length || 0
        const voteData = votesByPointId[point.id] || { sumOfVotes: 0, votes: { upvotes: 0, downvotes: 0 } }
        
        // Calculate days passed from the proceeding date
        const pointDate = new Date(point.proceeding_day.date)
        const daysPassed = Math.max(0, Math.floor((now.getTime() - pointDate.getTime()) / (1000 * 60 * 60 * 24)))
        
        return (
          10 * (votingCount > 0 ? 1 : 0) +
          20 * Math.min(statementsCount, 100) +
          voteData.sumOfVotes -
          daysPassed
        )
      }

      const scoreA = calcScore(a)
      const scoreB = calcScore(b)
      
      if (scoreB !== scoreA) return scoreB - scoreA
      return new Date(b.proceeding_day.date).getTime() - new Date(a.proceeding_day.date).getTime()
    })
    .slice(0, 200)
    .map((point) => {
      const [category, title] = point.topic?.split(' | ') || []
      const voteData = votesByPointId[point.id] || {
        sumOfVotes: 0,
        votes: { upvotes: 0, downvotes: 0 },
      }
      const statementsCount = point.statements?.length || 0
      return {
        category: category || 'Punkt obrad',
        title: title || point.topic || 'Bez tytułu',
        description: point.summary_tldr || '',
        likes: String(voteData.votes.upvotes - voteData.votes.downvotes),
        comments: '0',
        interested: '0',
        imageUrl: getRandomPhoto(String(point.id)),
        pointId: point.id,
        proceedingNumber: point.proceeding_day.proceeding.number,
        date: point.proceeding_day.date,
        votingNumbers: point.voting_numbers,
        officialPoint: point.official_point || null,
        votes: voteData.votes,
        statementsCount,
      }
    })
})

export const getAllCategories = cache(async (): Promise<string[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proceeding_point_ai')
    .select('topic')
    .not('topic', 'is', null)
    .limit(1000)

  const categoryCount = (data || []).reduce((acc, point: any) => {
    const category = point.topic?.split(' | ')[0]
    if (category) acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)
})

export const getMaxProceedingNumber = cache(async (): Promise<number> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proceeding')
    .select('number')
    .order('number', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return 0
  return (data as { number: number }).number
})

type ProceedingFromDB = {
  number: number
  dates: string[]
  proceeding_day: Array<{
    id: number
    date: string
    proceeding_point_ai: Array<{
      id: number
      topic: string
      summary_tldr: string | null
      voting_numbers: number[]
      official_point: string | null
    }>
  }>
}

// Note: Not using unstable_cache here because it needs server context (cookies)
export async function getProceedings(): Promise<ProceedingFromDB[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('proceeding')
    .select(`
      number,
      dates,
      proceeding_day (
        id,
        date,
        proceeding_point_ai (
          id,
          topic,
          summary_tldr,
          voting_numbers,
          official_point
        )
      )
    `)
    .order('number', { ascending: false })
  
  if (error) {
    console.error('Error fetching proceedings:', error)
    return []
  }
  
  return (data || []) as ProceedingFromDB[]
}
