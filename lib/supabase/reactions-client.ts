import { createClient } from '@/utils/supabase/client'
import { Reaction, ReactionCount } from './reactions'

export async function getReactionsForStatementClient(
  statementId: number
): Promise<ReactionCount[]> {
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return []
}

export async function getUserReactionsClient(
  statementId: number,
  userId: string
): Promise<Reaction[]> {
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return []
}

export async function addReactionClient(
  statementId: number,
  userId: string,
  emoji: string
): Promise<Reaction | null> {
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return null
}

export async function removeReactionClient(
  statementId: number,
  userId: string,
  emoji: string
): Promise<boolean> {
  // TODO: Implement reaction functionality when database schema is ready
  console.warn('Reaction functionality not yet implemented in database')
  return false
}
