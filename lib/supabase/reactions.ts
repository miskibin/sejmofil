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
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return []
}

export async function getUserReaction(
  targetId: number,
  targetType: 'statement' | 'process',
  userId: string
): Promise<string | null> {
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return null
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
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return { success: false, error: 'Reaction functionality not yet implemented' }
}
