import { createClient } from '@/utils/supabase/client'

export type ProcessVoteCount = {
  upvotes: number
  downvotes: number
}

export async function getProcessVoteCounts(processId: number): Promise<ProcessVoteCount> {
  const { data, error } = await createClient().rpc('get_process_vote_counts', {
    process_id: processId,
  } as any) // Using any temporarily due to type generation issues

  if (error) {
    console.error('Error fetching process vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }

  return data || { upvotes: 0, downvotes: 0 }
}

export async function getProcessUserVote(processId: number, userId: string): Promise<'up' | 'down' | null> {
  const { data, error } = await createClient()
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
  const supabase = createClient()

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
