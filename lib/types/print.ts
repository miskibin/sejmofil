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
  type?: string
  category?: string
  status?: string
}

export type PrintListItem = {
  topicName: any
  number: string
  title: string
  summary: string
  type: string
  date: string
  changeDate?: string // Add the missing changeDate field
  short_title?: string
  status: string
  categories: string[]
  organizations: string[]
  processPrint: string[]
  processDescription?: string // changed from processComment
  authorClubs: string[] // changed from { id: string; name: string }[]
}

export type Comment = {
  sentiment: 'Neutralny' | 'Pozytywny' | 'Negatywny'
  summary: string
  author: string
  organization: string
}
