export type Print = {
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

export type PrintShort = {
  documentDate: string;
  number: string;
  summary: string;
  title: string;
  processPrint: string[];
  attachments: string[];
};

export type PrintListItem = {
  title: string;
  number: string;
  processPrint: string[];
  topicName: string;
  topicDescription: string;
};
export type Comment = {
  sentiment: "Neutralny" | "Pozytywny" | "Negatywny";
  summary: string;
  author: string;
  organization: string;
};
