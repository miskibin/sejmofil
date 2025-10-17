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
        id, topic, summary_tldr, voting_numbers,
        proceeding_day!inner (
          date,
          proceeding!inner (number, title)
        )
      `)
      .order('id', { ascending: false })
      .ilike('topic', category ? `${category}%` : '%')
      .limit(1000),
  ])

  if (pointsRes.error) return []

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
        votes,
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
        id, topic, summary_tldr, voting_numbers,
        proceeding_day!inner (
          date,
          proceeding!inner (number, title)
        )
      `)
      .order('id', { ascending: false })
      .limit(1000),
  ])

  if (pointsRes.error) return []

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
        votes: voteData.votes,
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
