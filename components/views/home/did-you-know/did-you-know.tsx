import { CardWrapper } from '@/components/ui/card-wrapper'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getPoliticians } from './_utils/getPoliticians'

export async function DidYouKnow() {
  const { politicians } = await getPoliticians()

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
            key={politician.id}
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
