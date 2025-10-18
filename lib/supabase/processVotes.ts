import { createClient } from '@/utils/supabase/server'

export type ProcessVoteCount = {
  upvotes: number
  downvotes: number
}

export async function getProcessVoteCounts(processId: number): Promise<ProcessVoteCount> {
  const supabase = await createClient()
  
  // Query all votes for this process and aggregate in application layer
  // Note: RPC function 'get_process_vote_counts' doesn't exist in database
  const { data, error } = await supabase
    .from('process_votes')
    .select('vote_type')
    .eq('process_id', processId)
    .not('vote_type', 'is', null)

  if (error) {
    console.error('Error fetching process vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }

  // Aggregate the counts in application layer
  const counts = ((data || []) as Array<{ vote_type: string | null }>).reduce(
    (acc, vote) => {
      if (vote.vote_type === 'up') acc.upvotes++
      if (vote.vote_type === 'down') acc.downvotes++
      return acc
    },
    { upvotes: 0, downvotes: 0 }
  )

  return counts
}

/**
 * Batch fetch vote counts for multiple processes in a single query
 * This is more efficient than calling getProcessVoteCounts multiple times
 */
export async function getBatchProcessVoteCounts(
  processIds: number[]
): Promise<Map<number, ProcessVoteCount>> {
  if (processIds.length === 0) {
    return new Map()
  }

  const supabase = await createClient()
  
  // Fetch all votes for all processes in one query
  const { data, error } = await supabase
    .from('process_votes')
    .select('process_id, vote_type')
    .in('process_id', processIds)
    .not('vote_type', 'is', null)

  if (error) {
    console.error('Error fetching batch process vote counts:', error)
    // Return empty map with default values
    return new Map(processIds.map(id => [id, { upvotes: 0, downvotes: 0 }]))
  }

  // Aggregate counts per process
  const countsMap = new Map<number, ProcessVoteCount>()
  
  // Initialize all process IDs with zero counts
  processIds.forEach(id => {
    countsMap.set(id, { upvotes: 0, downvotes: 0 })
  })
  
  // Aggregate the votes
  ;((data || []) as Array<{ process_id: number; vote_type: string | null }>).forEach(vote => {
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
    const vote_type = existing === voteType ? null : voteType;

    const { error } = await supabase.from('process_votes').upsert(
      {
        process_id: processId,
        user_id: userId,
        vote_type: vote_type,
        created_at: new Date().toISOString(),
      } as any,
      {
        // Using any temporarily due to type generation issues
        onConflict: 'process_id,user_id',
      }
    )

    if (error) {
      console.error('Error updating process vote:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vote',
    }
  }
}
