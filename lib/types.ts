export type Person = {
  firstLastName: string;
  club?: string;
  firstName?: string;
  lastName?: string;
};

export type ProcessStage = {
  childStages: boolean;
  stageName: string;
  date: string;
};

export type Process = {
  number: string;
  title: string;
  term: string;
  documentType: string;
  changeDate: string;
  processStartDate: string;
};

export type Comment = {
  sentiment: "Neutralny" | "Pozytywny" | "Negatywny";
  summary: string;
  author: string;
  organization: string;
};
export type Print = {
  print: unknown;
  attachments: string[];
  changeDate: string;
  deliveryDate: string;
  documentDate: string;
  number: string;
  processPrint: string[];
  summary: string;
  term: number;
  title: string;
  documentType?: string;
};
export type Topic = {
  name: string;
  description: string;
};

export type PrintListItem = {
  title: string;
  number: string;
  topicName: string;
  topicDescription: string;
};

export type ProceedingPoint = {
  id: number;
  statement_concat_topic: string;
  statement_concat_description: string;
  term: number;
  proceeding_number: number;
  proceeding_day: number;
  proceeding_date: string;
  ai_proceeding_points_summary: string;
  ai_proceeding_points_analysis: PointAnalysis;
  discussion_order: number;
};

export type ProceedingPointDetails = {
  point: ProceedingPoint;
  statements: Statement[];
  statementsAI: StatementAI[];
};

export type ProceedingPointListItem = {
  id: number;
  discussion_order: number;
  statement_concat_topic: string;
  statement_concat_description: string;
  proceeding_number: number;
};

export type PointAnalysis = {
  coherence_fact: string;
  rethoric_intention: string;
};

export type Proceeding = {
  id: number;
  proceeding_number: number;
  term: number;
  title: string;
  dates: string[];
  points: ProceedingPointListItem[];
  proceeding_dates: string[];
  proceeding_title: string;
};

export type Statement = {
  id: number;
  statement_order: number;
  statement_number: number;
  statement_official_point: string;
  statement_official_topic: string;
  term: number;
  proceeding_number: number;
  proceeding_date: string;
  statement: string;
  statement_speaker: string;
  statement_speaker_function: string;
  statement_speaker_name: string;
  proceeding_total_days: number;
  proceeding_title: string;
  proceeding_day: number;
  statement_official_prints: string[];
  statement_source: string;
};
export type StatementAI = {
  id: number;
  ai_statement_summary: string;
  ai_statement_thesis_and_args: string[];
  ai_statement_interruptions: Record<string, object>;
  ai_statement_criticism: Record<string, object>;
  ai_statement_approvals: Record<string, object>;
  ai_statement_type: string;
  ai_statement_citations: string[];
  proceeding_date: string;
  statement_order: number;
  statement_number: number;
  term: number;
};
