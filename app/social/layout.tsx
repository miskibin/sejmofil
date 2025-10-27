import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo | Sejmofil',
  description: 'Demonstracja stylu wizualnego dla punktów obrad.',
}

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
