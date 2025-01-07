import { ProceedingPointAI } from "@/lib/types/proceeding";
import { VotingResult as SejmVotingResult } from "@/lib/api/sejm";

export interface ProceedingPoint extends ProceedingPointAI {
  votingResults: SejmVotingResult[];  // Remove optional
  breakVotingsCount: number;          // Remove optional
}

export interface ProceedingDay {
  id: number;
  date: string;
  proceeding_point_ai: ProceedingPoint[];
}

export interface Proceeding {
  number: number;
  dates: string[];
  proceeding_day: ProceedingDay[];
}

export type { SejmVotingResult as VotingResult };
