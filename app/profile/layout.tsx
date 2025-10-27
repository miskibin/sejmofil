import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil użytkownika | Sejmofil',
  description: 'Twój profil użytkownika. Zobacz swoje reakcje, komentarze i aktywność na Sejmofil.',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
