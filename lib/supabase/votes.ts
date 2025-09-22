import { createClient } from '@/utils/supabase/client'
import { VoteCount } from '@/lib/types/proceeding'

export async function getVoteCounts(pointId: number): Promise<VoteCount> {
  try {
    const { data, error } = await createClient().rpc('get_vote_counts', {
      point_id: pointId,
    } as any) // Using any temporarily due to type generation issues
    
    if (error) {
      console.error(`RPC error for get_vote_counts with pointId ${pointId}:`, error)
      throw error
    }
    
    // Handle different return formats from the function
    if (Array.isArray(data) && (data as any).length > 0) {
      return (data as any)[0] || { upvotes: 0, downvotes: 0 }
    }
    
    return (data as any) || { upvotes: 0, downvotes: 0 }
  } catch (error) {
    console.error(`Failed to get vote counts for pointId ${pointId}:`, error);
    // Return default values on error to prevent UI breaking
    return { upvotes: 0, downvotes: 0 };
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

    if (error) {
      console.error(`Database error for getUserVote with pointId ${pointId}, userId ${userId}:`, error)
      throw error
    }

    // Validate vote_type value
    const voteType = (data as any)?.vote_type
    if (voteType && !['up', 'down'].includes(voteType)) {
      console.warn(`Invalid vote_type "${voteType}" for pointId ${pointId}, userId ${userId}`)
      return null
    }

    return (voteType as 'up' | 'down') || null
  } catch (error) {
    console.error(`Failed to get user vote for pointId ${pointId}:`, error);
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
    console.error(`Failed to toggle vote for pointId ${pointId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update vote' 
    }
  }
}
