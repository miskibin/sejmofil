import { Driver, Session } from "neo4j-driver";

export type PrintAuthor = {
  firstLastName: string;
  club?: string;
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
  attachments: string[];
  changeDate: string;
  deliveryDate: string;
  documentDate: string;
  number: string;
  processPrint: number[];
  summary: string;
  term: number;
  title: string;
  documentType?: string;
};
export type Topic = {
  name: string;
  description: string;
};
