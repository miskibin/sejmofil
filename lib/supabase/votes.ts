import { createClient } from '@/utils/supabase/client'
import { Vote, VoteCount } from '@/lib/types/proceeding'

export async function getVoteCounts(pointId: number): Promise<VoteCount> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_vote_counts', {
    point_id: pointId,
  } as any) // Using any temporarily due to type generation issues

  if (error) {
    console.error('Error fetching vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }

  // The RPC returns an array, we take the first element
  const result = Array.isArray(data) ? data[0] : data
  return result || { upvotes: 0, downvotes: 0 }
}

export async function getUserVote(
  pointId: number,
  userId: string
): Promise<'up' | 'down' | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('point_id', pointId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user vote:', error)
    return null
  }

  return ((data as any)?.vote_type as 'up' | 'down') || null
}

export async function toggleVote(
  pointId: number,
  userId: string,
  voteType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const existing = await getUserVote(pointId, userId)

    const { error } = await supabase.from('votes').upsert(
      {
        point_id: pointId,
        user_id: userId,
        vote_type: existing === voteType ? null : voteType,
        created_at: new Date().toISOString(),
      } as any,
      {
        // Using any temporarily due to type generation issues
        onConflict: 'point_id,user_id',
      }
    )

    if (error) {
      console.error('Error updating vote:', error)
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
