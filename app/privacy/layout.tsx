import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka Prywatności | Sejmofil',
  description: 'Polityka prywatności serwisu Sejmofil. Dowiedz się, jak przetwarzamy Twoje dane osobowe.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
