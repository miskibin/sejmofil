import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O Projekcie | Sejmofil',
  description:
    'Sejmofil to projekt non-profit zwiększający transparentność pracy Sejmu poprzez wykorzystanie sztucznej inteligencji do analizy danych parlamentarnych.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
