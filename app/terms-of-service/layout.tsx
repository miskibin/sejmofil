import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin | Sejmofil',
  description:
    'Regulamin korzystania z serwisu Sejmofil. Zasady użytkowania platformy analizy pracy Sejmu.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
