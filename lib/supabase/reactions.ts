import { createClient } from '@/utils/supabase/client'

export type Reaction = {
  target_id: string
  target_type: 'statement' | 'process'
  user_id: string
  emoji: string
}

export type ReactionCount = {
  emoji: string
  count: number
}

export type OptimisticReaction = {
  type: 'add' | 'remove'
  emoji: string
  targetId: number
  targetType: 'statement' | 'process'
  userId: string
}

const COOLDOWN_MS = 500 // Dummy cooldown for now full implementation here: https://github.com/miskibin/sejmofil/issues/15
let lastReactionTime = 0

export async function getReactions(
  targetId: number,
  targetType: 'statement' | 'process'
): Promise<ReactionCount[]> {
  const { data, error } = await createClient().rpc('get_reaction_counts', {
    target_id: targetId,
    target_type: targetType,
  })
  return data || []
}

export async function getUserReaction(
  targetId: number,
  targetType: 'statement' | 'process',
  userId: string
): Promise<string | null> {
  const { data, error } = await createClient()
    .from('reaction') // Changed from 'reactions' to 'reaction'
    .select('emoji')
    .eq('target_id', targetId)
    .eq('target_type', targetType)
    .eq('user_id', userId)
    .single()
  return data?.emoji || null
}

export function updateReactionCounts(
  counts: ReactionCount[],
  reaction: OptimisticReaction
): ReactionCount[] {
  const existingIndex = counts.findIndex((c) => c.emoji === reaction.emoji)

  if (reaction.type === 'add') {
    if (existingIndex >= 0) {
      return counts.map((c, i) =>
        i === existingIndex ? { ...c, count: c.count + 1 } : c
      )
    }
    return [...counts, { emoji: reaction.emoji, count: 1 }]
  } else {
    if (existingIndex >= 0) {
      return counts.map((c, i) =>
        i === existingIndex ? { ...c, count: Math.max(0, c.count - 1) } : c
      )
    }
    return counts
  }
}

export async function toggleReaction(
  targetId: number,
  targetType: 'statement' | 'process',
  userId: string,
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  const now = Date.now()
  if (now - lastReactionTime < COOLDOWN_MS) {
    return {
      success: false,
      error: 'Reakcje można zmieniać co 0.5 sekundy',
    }
  }

  const supabase = createClient()
  try {
    const existing = await getUserReaction(targetId, targetType, userId)

    if (existing === emoji) {
      await supabase
        .from('reaction') // Changed from 'reactions' to 'reaction'
        .delete()
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .eq('user_id', userId)
    } else {
      if (existing) {
        await supabase
          .from('reaction') // Changed from 'reactions' to 'reaction'
          .delete()
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('user_id', userId)
      }
      await supabase.from('reaction').insert([
        {
          target_id: targetId,
          target_type: targetType,
          user_id: userId,
          emoji,
        },
      ])
    }

    lastReactionTime = now
    return { success: true }
  } catch (error) {
    console.error('Reaction error:', error)
    return { success: false, error: 'Failed to update reaction' }
  }
}
