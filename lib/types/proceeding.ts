export interface ProceedingPointAI {
  id: number;
  proceeding_day_id: number;
  official_point: string;
  official_topic: string;
  summary_main: string;
  summary_tldr: string;
  topic: string;
  number_sequence: number;
  voting_numbers: number[];
  print_numbers: number[];
}

export interface Proceeding {
  id: number;
  points: ProceedingPointAI[];
}
