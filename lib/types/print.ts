export type Print = {
  attachments: string[]
  changeDate: string
  deliveryDate: string
  documentDate: string
  number: string
  processPrint: string[]
  summary: string
  term: number
  title: string
  documentType?: string
}

export type PrintShort = {
  documentDate: string
  number: string
  summary: string
  title: string
  processPrint: string[]
  attachments: string[]
  similarity?: number
}

export type PrintListItem = {
  topicName: any
  number: string
  title: string
  short_title?: string
  summary: string
  type: string
  date: string
  status: string
  categories: string[]
  processPrint: string[]
}

export type Comment = {
  sentiment: 'Neutralny' | 'Pozytywny' | 'Negatywny'
  summary: string
  author: string
  organization: string
}
