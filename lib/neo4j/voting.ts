import { runQuery } from "@/db/client";

export interface VotingResult {
  votingNumber: number;
  topic: string;
  sitting: number;
  yes: number;
  no: number;
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
    `;

  return runQuery<VotingResult>(query, { sitting, voting_numbers });
}
