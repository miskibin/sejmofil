export const DOCUMENT_TYPES = [
  'projekt ustawy',
  'projekt uchwały',
  'lista kandydatów',
  'wniosek',
  'informacja rządowa',
  'informacja innych organów',
  'zawiadomienie',
  'sprawozdanie',
  'wniosek (bez druku)'
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]
