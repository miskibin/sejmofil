import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Błąd | Sejmofil',
  description: 'Przepraszamy, wystąpił nieoczekiwany błąd.',
}

export default function ErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
