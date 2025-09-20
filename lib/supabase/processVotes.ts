import { createClient } from '@/utils/supabase/client'

export type ProcessVoteCount = {
  upvotes: number
  downvotes: number
}

const processVoteClient = () => createClient().from('process_votes')

export async function getProcessVoteCounts(processId: number): Promise<ProcessVoteCount> {
  const { data } = await createClient().rpc('get_process_vote_counts', { process_id: processId })
  return data || { upvotes: 0, downvotes: 0 }
}

export async function getProcessUserVote(processId: number, userId: string): Promise<'up' | 'down' | null> {
  const { data } = await processVoteClient()
    .select('vote_type')
    .eq('process_id', processId)
    .eq('user_id', userId)
    .maybeSingle()
  return data?.vote_type || null
}

export async function toggleProcessVote(
  processId: number,
  userId: string,
  voteType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await getProcessUserVote(processId, userId)
    const vote_type = existing === voteType ? null : voteType;

    const { error } = await processVoteClient().upsert(
      {
        process_id: processId,
        user_id: userId,
        vote_type: vote_type,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'process_id,user_id' }
    )

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update vote' }
  }
}
