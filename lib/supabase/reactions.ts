import { createClient } from '@/utils/supabase/client'

export type Reaction = {
    statement_id: number
    user_id: string
    emoji: string
    }

export type ReactionCount = {
  emoji: string
  count: number
}

export async function getReactions(statementId: number): Promise<ReactionCount[]> {
  const { data } = await createClient()
    .rpc('get_reaction_counts', { statement_id: statementId })
  return data || []
}

export async function getUserReaction(statementId: number, userId: string): Promise<string | null> {
  const { data } = await createClient()
    .from('reactions')
    .select('emoji')
    .eq('statement_id', statementId)
    .eq('user_id', userId)
    .single()
  return data?.emoji || null
}

export async function toggleReaction(statementId: number, userId: string, emoji: string): Promise<boolean> {
  const supabase = createClient()
  const existing = await getUserReaction(statementId, userId)

  if (existing === emoji) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('statement_id', statementId)
      .eq('user_id', userId)
    return !error
  }

  if (existing) {
    await supabase
      .from('reactions')
      .delete()
      .eq('statement_id', statementId)
      .eq('user_id', userId)
  }

  const { error } = await supabase
    .from('reactions')
    .insert([{ statement_id: statementId, user_id: userId, emoji }])
  
  return !error
}
