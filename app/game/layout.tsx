import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gra - Koszty Sejmu | Sejmofil',
  description: 'Sprawdź swoją reakcję i dowiedz się, ile kosztuje praca Sejmu. Interaktywna gra edukacyjna.',
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
