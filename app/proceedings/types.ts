import { ProceedingPointAI } from "@/lib/types/proceeding";
import { VotingResult as SejmVotingResult } from "@/lib/api/sejm";

export interface ProceedingPoint extends ProceedingPointAI {
  statements: unknown;
  votingResults?: SejmVotingResult[];
  breakVotingsCount?: number;
}

export type { SejmVotingResult as VotingResult };
