import { createClient } from '@/utils/supabase/server'

export type ProcessVoteCount = {
  upvotes: number
  downvotes: number
}

type VoteData = Array<{ vote_type: string | null }>
type BatchVoteData = Array<{ process_id: number; vote_type: string | null }>

// Helper to aggregate vote counts
function aggregateVotes(votes: VoteData): ProcessVoteCount {
  return votes.reduce(
    (acc, vote) => {
      if (vote.vote_type === 'up') acc.upvotes++
      if (vote.vote_type === 'down') acc.downvotes++
      return acc
    },
    { upvotes: 0, downvotes: 0 }
  )
}

export async function getProcessVoteCounts(processId: number): Promise<ProcessVoteCount> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('process_votes')
    .select('vote_type')
    .eq('process_id', processId)
    .not('vote_type', 'is', null)

  if (error) {
    console.error('Error fetching process vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }

  return aggregateVotes((data || []) as VoteData)
}

/**
 * Batch fetch vote counts for multiple processes in a single query
 */
export async function getBatchProcessVoteCounts(
  processIds: number[]
): Promise<Map<number, ProcessVoteCount>> {
  if (!processIds.length) return new Map()

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('process_votes')
    .select('process_id, vote_type')
    .in('process_id', processIds)
    .not('vote_type', 'is', null)

  if (error) {
    console.error('Error fetching batch process vote counts:', error)
    return new Map(processIds.map(id => [id, { upvotes: 0, downvotes: 0 }]))
  }

  const countsMap = new Map(processIds.map(id => [id, { upvotes: 0, downvotes: 0 }]))
  
  ;(data as BatchVoteData).forEach(vote => {
    const current = countsMap.get(vote.process_id)
    if (current) {
      if (vote.vote_type === 'up') current.upvotes++
      if (vote.vote_type === 'down') current.downvotes++
    }
  })

  return countsMap
}

export async function getProcessUserVote(processId: number, userId: string): Promise<'up' | 'down' | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('process_votes')
    .select('vote_type')
    .eq('process_id', processId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching process user vote:', error)
    return null
  }

  return (data as any)?.vote_type || null
}

export async function toggleProcessVote(
  processId: number,
  userId: string,
  voteType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const existing = await getProcessUserVote(processId, userId)
    const vote_type = existing === voteType ? null : voteType

    const { error } = await supabase.from('process_votes').upsert(
      {
        process_id: processId,
        user_id: userId,
        vote_type,
        created_at: new Date().toISOString(),
      } as any,
      { onConflict: 'process_id,user_id' }
    )

    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vote',
    }
  }
}
