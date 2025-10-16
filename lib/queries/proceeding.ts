import { runQuery } from '../db/client'
import { ProceedingDates } from '../types/process'
import { cache } from 'react'

export async function getTotalProceedingDays(): Promise<number> {
  const query = `
      MATCH (p:Proceeding)
      WITH p, date() as today
      UNWIND p.proceeding_dates as dateStr
      WITH date(dateStr) as proceedingDate, today
      WHERE proceedingDate <= today
      RETURN count(proceedingDate) as totalDays
    `
  const result = await runQuery<{ totalDays: number }>(query)
  return result[0]?.totalDays
}

// Cache expensive getProceedingDates query
export const getProceedingDates = cache(async (): Promise<ProceedingDates[]> => {
  const query = `
      MATCH (p:Proceeding)
      UNWIND p.proceeding_dates AS date
      RETURN p.proceeding_number AS proceeding_number, 
             collect(date) AS proceeding_dates
      ORDER BY proceeding_number;
    `

  const result = await runQuery<Record<string, unknown> & ProceedingDates>(
    query
  )
  return result
})

export async function getProceedingPoints() {
  const query = `
    MATCH (p:Proceeding)-[:HAS_DAY]->(d:ProceedingDay)-[:HAS_POINT]->(point:ProceedingPoint)
    OPTIONAL MATCH (point)-[:HAS_VOTING]->(v:Voting)
    WITH p, d, point, collect(v) as votings
    RETURN {
      id: point.id,
      type: point.type,
      title: point.title,
      summary: point.summary,
      description: point.description,
      proceedingNumber: p.number,
      date: d.date,
      votingNumbers: [v in votings | v.votingNumber],
      votesFor: reduce(total = 0, v IN votings | total + v.yes),
      commentCount: point.commentCount,
      interestedCount: point.interestedCount
    } ORDER BY d.date DESC LIMIT 10
  `

  return runQuery(query)
}

export interface VotingResult {
  votingNumber: number
  topic: string
  sitting: number
  yes: number
  no: number
}

export async function getVotingResultsByNumbrs(
  sitting: number,
  voting_numbers: number[]
): Promise<VotingResult[]> {
  const query = `
    MATCH (v:Voting)
    WHERE v.sitting = $sitting AND v.votingNumber IN $voting_numbers
    RETURN  v.votingNumber as votingNumber, 
           v.topic as topic, v.yes as yes, v.no as no, v.sitting as sitting
    ORDER BY v.votingNumber
  `

  return runQuery<VotingResult>(query, { sitting, voting_numbers })
}
