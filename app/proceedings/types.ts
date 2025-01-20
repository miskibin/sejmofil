import { VotingResult as SejmVotingResult } from '@/lib/api/sejm'
import { ProceedingPointAI } from '@/lib/types/proceeding'

export interface ProceedingPoint extends ProceedingPointAI {
  votingResults: SejmVotingResult[]
  breakVotingsCount: number
  date: string
}

export interface ProcessedPoint extends ProceedingPoint {
  isInterrupted?: boolean
  isContinuation?: boolean
}

export interface ProceedingDay {
  id: number
  date: string
  proceeding_point_ai: ProceedingPoint[]
}

export interface Proceeding {
  number: number
  dates: string[]
  proceeding_day: ProceedingDay[]
}

export type { SejmVotingResult as VotingResult }

export interface PointRenderProps {
  point: ProceedingPoint
  pointsByNumber: Record<string, ProceedingPoint[]>
  proceeding: Proceeding
  day: ProceedingDay
}
