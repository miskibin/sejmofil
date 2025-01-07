export interface ProceedingPointAI {
  id: number;
  proceeding_day_id: number;
  official_point: string;
  official_topic: string;
  summary_main: SummaryMain;
  summary_tldr: string;
  topic: string;
  number_sequence: number;
  voting_numbers: number[];
  print_numbers: number[];
}
export interface SummaryMain {
  outtakes: string;
  next_steps: string;
  unresolved: string;
  main_topics: string;
  key_positions: string;
}

export interface Proceeding {
  id: number;
  term: number;
  title: string;
  dates: string;
}

export interface ProceedingDay {
  id: number;
  proceeding_id: number;
  day_no: number;
  date: Date;
}

export interface ProceedingPointExtended extends ProceedingPointAI {
  date?: string; // Add this for sorting
}

export interface ProceedingDayBase {
  id: number;
  proceeding_id: number;
  day_no: number;
  date: Date;
}

export interface PointsByNumberMap {
  [key: string]: ProceedingPointExtended[];
}
