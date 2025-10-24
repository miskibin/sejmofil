import { createClient } from '@/utils/supabase/client'
import { VoteCount } from '@/lib/types/proceeding'

const DEFAULT_VOTES: VoteCount = { upvotes: 0, downvotes: 0 }

export async function getVoteCounts(pointId: number): Promise<VoteCount> {
  try {
    const { data, error } = await createClient().rpc('get_vote_counts', {
      point_id: pointId,
    } as any)

    if (error) throw error

    return (Array.isArray(data) ? data[0] : data) || DEFAULT_VOTES
  } catch (error) {
    console.error(`Vote counts error for point ${pointId}:`, error)
    return DEFAULT_VOTES
  }
}

export async function getUserVote(
  pointId: number,
  userId: string
): Promise<'up' | 'down' | null> {
  try {
    const { data, error } = await createClient()
      .from('votes')
      .select('vote_type')
      .eq('point_id', pointId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error

    const voteType = (data as any)?.vote_type
    return ['up', 'down'].includes(voteType) ? voteType : null
  } catch (error) {
    console.error(`User vote error for point ${pointId}:`, error)
    return null
  }
}

export async function toggleVote(
  pointId: number,
  userId: string,
  voteType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const existing = await getUserVote(pointId, userId)

    const { error } = await supabase.from('votes').upsert(
      {
        point_id: pointId,
        user_id: userId,
        vote_type: existing === voteType ? null : voteType,
        created_at: new Date().toISOString(),
      } as any,
      { onConflict: 'point_id,user_id' }
    )

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error(`Toggle vote error for point ${pointId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vote',
    }
  }
}
