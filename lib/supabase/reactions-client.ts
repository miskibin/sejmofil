import { createClient } from '@/utils/supabase/client'
import { Reaction, ReactionCount } from './reactions'

export async function getReactionsForStatementClient(statementId: number): Promise<ReactionCount[]> {
  const supabase = createClient()
  const { data } = await supabase
    .rpc('get_reaction_counts', { statement_id: statementId })
  return data || []
}

export async function getUserReactionsClient(statementId: number, userId: string): Promise<Reaction[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('reactions')
    .select('*')
    .eq('statement_id', statementId)
    .eq('user_id', userId)
  return data || []
}

export async function addReactionClient(statementId: number, userId: string, emoji: string): Promise<Reaction | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reactions')
    .insert([
      { statement_id: statementId, user_id: userId, emoji }
    ])
    .select()
    .single()
    
  if (error) return null
  return data
}

export async function removeReactionClient(statementId: number, userId: string, emoji: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('statement_id', statementId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    
  return !error
}
