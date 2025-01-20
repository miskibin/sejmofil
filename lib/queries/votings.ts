import { runQuery } from '../db/client'

export async function getBreakVotes(): Promise<number> {
  const query = `
    MATCH (v:Voting)
    WHERE v.topic CONTAINS 'przerwę'
    RETURN count(v) as breaks
    `
  const result = await runQuery<{ breaks: number }>(query)
  return result[0]?.breaks
}
