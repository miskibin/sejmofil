export interface VotingResult {
  topic: string;
  votes: { vote: string }[];
  totalVoted: number;
  passed?: boolean;
}

export interface ProceedingPoint {
  id: number;
  topic: string;
  summary_tldr: string;
  voting_numbers: number[];
  votingResults?: (VotingResult | null)[];
  breakVotingsCount?: number;
}
