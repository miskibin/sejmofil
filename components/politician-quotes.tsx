import { CardWrapper } from "@/components/ui/card-wrapper";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { getLatestCitizations } from "@/lib/supabase/queries";
import { getIdsFromNames } from "@/lib/queries/person";
import Link from "next/link";

export default async function PoliticianQuotes() {
  const citations = await getLatestCitizations();
  const envoys = await getIdsFromNames(
    citations.map((citation) => citation.speaker_name)
  );
  const combined = citations.map((citation, index) => ({
    ...citation,
    envoy_id: envoys[index],
  }));
  return (
    <CardWrapper
      title="Ciekawostki"
      subtitle="Cytaty"
      showGradient={true}
      headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        {combined.map((quote, index) => (
          <Link
            href={`/envoys/${quote.envoy_id}`}
            prefetch={true}
            key={quote.envoy_id + index}
            className="flex items-center gap-4"
          >
            <Image
              src={`https://api.sejm.gov.pl/sejm/term10/MP/${quote.envoy_id}/photo`}
              alt={quote.speaker_name}
              width={48}
              height={48}
              className="rounded-md"
            />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-primary">
                {quote.speaker_name}
              </p>
              <p className="text-sm italic font-normal leading-tight">
                {quote.citation}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </CardWrapper>
  );
}
