import { CardWrapper } from '@/components/ui/card-wrapper'
import { getIdsFromNames } from '@/lib/queries/person'
import { getLatestCitizations } from '@/lib/supabase/getLatestCitizations'
import { truncateText } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function PoliticianQuotes() {
  const citations = await getLatestCitizations(2)
  const envoys = await getIdsFromNames(
    citations.map((citation) => citation.speaker_name)
  )
  const combined = citations.map((citation, index) => ({
    ...citation,
    envoy_id: envoys[index],
  }))
  return (
    <CardWrapper
      title="Ciekawostki"
      subtitle="Cytaty"
      showGradient={true}
      headerIcon={<Sparkles className="h-5 w-5 text-primary" fill="#76052a" />}
    >
      <div className="space-y-4">
        {combined.map((quote, index) => (
          <Link
            href={`/envoys/${quote.envoy_id}`}
            prefetch={true}
            key={quote.envoy_id + index}
          >
            <div className="flex items-center gap-4 pt-4">
              <Image
                src={`https://api.sejm.gov.pl/sejm/term10/MP/${quote.envoy_id}/photo`}
                alt={quote.speaker_name}
                width={48}
                height={48}
                className="rounded-md"
              />
              <p className="text-sm font-semibold text-primary">
                {quote.speaker_name}
              </p>
            </div>
            <p className="italic">{truncateText(quote.citation, 300)}</p>
          </Link>
        ))}
      </div>
    </CardWrapper>
  )
}
