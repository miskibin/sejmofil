import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posłowie | Sejmofil',
  description:
    'Lista wszystkich posłów Sejmu RP wraz z ich aktywnością, statystykami i analizą wypowiedzi parlamentarnych.',
  openGraph: {
    title: 'Posłowie Sejmu RP',
    description:
      'Poznaj aktywność i statystyki posłów w Sejmie. Dowiedz się więcej o ich wypowiedziach, głosowaniach i pracy w komisjach.',
    images: [
      {
        url: '/og/envoys.png',
        width: 1200,
        height: 630,
        alt: 'Posłowie Sejmu RP',
      },
    ],
  },
  keywords: [
    'posłowie',
    'Sejm RP',
    'parlament',
    'statystyki',
    'aktywność poselska',
    'komisje sejmowe',
    'głosowania',
    'wypowiedzi',
  ],
}

export default function EnvoysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
