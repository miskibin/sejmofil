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

const COOLDOWN_MS = 500 // Dummy cooldown for now full implementation here: https://github.com/miskibin/sejmofil/issues/15
let lastReactionTime = 0

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

export async function toggleReaction(
  statementId: number, 
  userId: string, 
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  const now = Date.now()
  if (now - lastReactionTime < COOLDOWN_MS) {
    return {
      success: false,
      error: 'Reakcje można zmieniać co 0.5 sekundy'
    }
  }

  const supabase = createClient()
  try {
    const existing = await getUserReaction(statementId, userId)

    if (existing === emoji) {
      await supabase
        .from('reactions')
        .delete()
        .eq('statement_id', statementId)
        .eq('user_id', userId)
    } else {
      if (existing) {
        await supabase
          .from('reactions')
          .delete()
          .eq('statement_id', statementId)
          .eq('user_id', userId)
      }
      await supabase
        .from('reactions')
        .insert([{ statement_id: statementId, user_id: userId, emoji }])
    }

    lastReactionTime = now
    return { success: true }
  } catch (error) {
    console.error('Reaction error:', error)
    return { success: false, error: 'Failed to update reaction' }
  }
}
