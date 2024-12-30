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

export type Topic = {
  name: string;
  description: string;
};
export interface ProceedingDates {
  proceeding_number: string;
  proceeding_dates: string[];
}
