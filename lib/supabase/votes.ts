import { createClient } from '@/utils/supabase/client'
import { Vote, VoteCount } from '@/lib/types/proceeding'

export async function getVoteCounts(pointId: number): Promise<VoteCount> {
  const { data, error } = await createClient().rpc('get_vote_counts', {
    point_id: pointId,
  })
  return data || { upvotes: 0, downvotes: 0 }
}

export async function getUserVote(
  pointId: number,
  userId: string
): Promise<'up' | 'down' | null> {
  const { data } = await createClient()
    .from('votes')
    .select('vote_type')
    .eq('point_id', pointId)
    .eq('user_id', userId)
    .maybeSingle()

  return data?.vote_type || null
}

export async function toggleVote(
  pointId: number,
  userId: string,
  voteType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  
  const supabase = createClient()
  
  try {
    const existing = await getUserVote(pointId, userId)

    const { error } = await supabase
      .from('votes')
      .upsert(
        {
          point_id: pointId,
          user_id: userId,
          vote_type: existing === voteType ? null : voteType,
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'point_id,user_id'
        }
      )

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update vote' 
    }
  }
}
