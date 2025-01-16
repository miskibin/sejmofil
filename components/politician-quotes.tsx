import { CardWrapper } from "@/components/ui/card-wrapper";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { getLatestCitizations } from "@/lib/supabase/queries";
import { getIdsFromNames } from "@/lib/queries/person";
import Link from "next/link";
import { truncateText } from "@/lib/utils";

export default async function PoliticianQuotes() {
  const citations = await getLatestCitizations(2);
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
      headerIcon={<Sparkles className="w-4 h-4 m-1 text-white " fill="white" />}
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
  );
}
