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
