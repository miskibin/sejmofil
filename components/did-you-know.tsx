import { CardWrapper } from '@/components/ui/card-wrapper'
import {
  getPersonWithMostAbsents,
  getPersonWithMostInterruptions,
  getPersonWithMostStatements,
} from '@/lib/queries/person'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function PlebiscytCard() {
  const mostInterruptions = await getPersonWithMostInterruptions()
  const mostAbsents = await getPersonWithMostAbsents()
  const leastAbsents = await getPersonWithMostAbsents(true)
  const mostStatements = await getPersonWithMostStatements()
  const politicians = [
    {
      ...mostAbsents,
      mainStat: {
        value: mostAbsents.count,
        url: `/envoys?ranking=statements`,
        displayText: `Nieobecności: ${mostAbsents.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostAbsents.id}.jpeg`,
    },
    {
      ...mostStatements,
      mainStat: {
        value: mostStatements.count,
        url: `/envoys?ranking=statements`,
        displayText: `Wypowiedzi: ${mostStatements.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostStatements.id}.jpeg`,
    },
    {
      ...leastAbsents,
      mainStat: {
        url: `/envoys?ranking=absents`,
        value: leastAbsents.count,
        displayText: `Nieobecności: ${leastAbsents.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${leastAbsents.id}.jpeg`,
    },
    ...(mostInterruptions
      ? [
          {
            ...mostInterruptions,
            mainStat: {
              value: mostInterruptions.count,
              url: `/envoys?ranking=interruptions`,
              displayText: `Przerwał/a: ${mostInterruptions.count} razy`,
            },
            image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostInterruptions.id}.jpeg`,
          },
        ]
      : []),
    {
      name: 'Donald Tusk',
      id: '400',
      count: 42,
      mainStat: {
        value: 42,
        url: `/envoys?ranking=votes`,
        displayText: 'Wypowiedzi: 42',
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/400.jpeg`,
    },
  ]

  return (
    <CardWrapper
      title="Rekordziści 10 kadencji"
      className="h-full"
      sourceDescription="Informacje wynikają z analizy AI oficjalnych danych sejmowych"
      sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
      aiPrompt="Give me interesting statistics about politicians."
      subtitle="Czy wiesz, że?"
      showMoreLink="/envoys"
      showGradient={true}
      headerIcon={<Sparkles className="h-5 w-5 text-primary" fill="#76052a" />}
    >
      <div className="space-y-2">
        {politicians.map((politician) => (
          <Link
            href={politician.mainStat.url}
            key={politician.id + politician.mainStat.value}
            prefetch={true}
            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-primary/5"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">
                {politician.name}
              </p>
              <div className="flex flex-row font-medium">
                <span>{politician.mainStat.displayText}</span>
              </div>
            </div>
            <Image
              src={politician.image}
              alt={politician.name}
              width={48}
              height={60}
              className="size-auto"
            />
          </Link>
        ))}
      </div>
    </CardWrapper>
  )
}
