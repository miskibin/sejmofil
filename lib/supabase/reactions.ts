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
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('target_id', targetId)
      .eq('target_type', targetType)

    if (error) {
      console.error('Error getting reactions:', error)
      return []
    }

    // Count reactions by emoji
    const reactionCounts: Record<string, number> = {}
    data?.forEach(({ emoji }) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1
    })

    return Object.entries(reactionCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error getting reactions:', error)
    return []
  }
}

export async function getUserReaction(
  targetId: number,
  targetType: 'statement' | 'process',
  userId: string
): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error getting user reaction:', error)
      return null
    }

    return (data as any)?.emoji || null
  } catch (error) {
    console.error('Error getting user reaction:', error)
    return null
  }
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
  const supabase = createClient()

  try {
    // Check for existing reaction
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing reaction:', checkError)
      return { success: false, error: checkError.message }
    }

    if (existingReaction) {
      if ((existingReaction as any).emoji === emoji) {
        // Same emoji, remove the reaction
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('user_id', userId)

        if (deleteError) {
          console.error('Error removing reaction:', deleteError)
          return { success: false, error: deleteError.message }
        }
      } else {
        // Different emoji, update the reaction
        const { error: updateError } = await (supabase.from('reactions') as any)
          .update({ emoji, updated_at: new Date().toISOString() })
          .eq('target_id', targetId)
          .eq('target_type', targetType)
          .eq('user_id', userId)

        if (updateError) {
          console.error('Error updating reaction:', updateError)
          return { success: false, error: updateError.message }
        }
      }
    } else {
      // No existing reaction, add new one
      const { error: insertError } = await (
        supabase.from('reactions') as any
      ).insert({
        target_id: targetId,
        target_type: targetType,
        user_id: userId,
        emoji,
      })

      if (insertError) {
        console.error('Error adding reaction:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
