import { Database } from "./supabase";

export type ProceedingPointWithRelations =
  Database["public"]["Tables"]["proceeding_point_ai"]["Row"] & {
    proceeding_day: Database["public"]["Tables"]["proceeding_day"]["Row"] & {
      proceeding: Database["public"]["Tables"]["proceeding"]["Row"];
    };
  };

export interface SummaryMain {
  outtakes: string;
  next_steps: string;
  unresolved: string;
  main_topics: string;
  key_positions: string;
}

export type PointWithStatements = {
  id: number;
  topic: string;
  official_point: string;
  official_topic: string;
  summary_main: SummaryMain;
  summary_tldr: string;
  voting_numbers: number[];
  print_numbers: number[];
  proceeding_day: {
    date: string;
    proceeding: {
      number: number;
    };
  };
  statements: {
    id: number;
    speaker_name: string;
    text: string;
    number_source: number;
    number_sequence: number;
    statement_ai: Database["public"]["Tables"]["statement_ai"]["Row"];
  }[];
};
