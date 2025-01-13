import { CardWrapper } from "@/components/ui/card-wrapper";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getPersonWithMostInterruptions,
  getPersonWithMostAbsents,
  getPersonWithMostStatements,
} from "@/lib/queries/person";

export default async function PlebiscytCard() {
  const mostInterruptions = (await getPersonWithMostInterruptions()) || 0;
  const mostAbsents = await getPersonWithMostAbsents();
  const leastAbsents = await getPersonWithMostAbsents(true);
  const mostStatements = await getPersonWithMostStatements();
  const politicians = [
    {
      ...mostAbsents,
      mainStat: {
        value: mostAbsents.count,
        url: `/envoys?ranking=statements`,
        displayText: `Nieobecności: ${mostAbsents.count}`,
      },
      image: `https://api.sejm.gov.pl/sejm/term10/MP/${mostAbsents.id}/photo`,
    },
    {
      ...mostStatements,
      mainStat: {
        value: mostStatements.count,
        url: `/envoys?ranking=statements`,
        displayText: `Wypowiedzi: ${mostStatements.count}`,
      },
      image: `https://api.sejm.gov.pl/sejm/term10/MP/${mostStatements.id}/photo`,
    },
    {
      ...leastAbsents,
      mainStat: {
        url: `/envoys?ranking=absents`,
        value: leastAbsents.count,
        displayText: `Nieobecności: ${leastAbsents.count}`,
      },
      image: `https://api.sejm.gov.pl/sejm/term10/MP/${leastAbsents.id}/photo`,
    },

    {
      ...mostInterruptions,
      mainStat: {
        value: 0,
        url: `/envoys?ranking=interruptions`,
        displayText: `Przerwał/a: ${mostInterruptions.count} razy`,
      },
      image: `https://api.sejm.gov.pl/sejm/term10/MP/${mostInterruptions.id}/photo`,
    },
    {
      name: "Donald Tusk",
      id: "400",
      count: 42,
      mainStat: {
        value: 42,
        url: `/envoys?ranking=votes`,
        displayText: "Wypowiedzi: 42",
      },
      image: "https://api.sejm.gov.pl/sejm/term10/MP/400/photo",
    },
  ];

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
      headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-2 ">
        {politicians.map((politician) => (
          <Link
            href={politician.mainStat.url}
            key={politician.id}
            prefetch={true}
            className="flex items-center justify-between hover:bg-primary/5 p-2 rounded-lg transition-colors"
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
              height={48}
              className="rounded-full"
            />
          </Link>
        ))}
      </div>
    </CardWrapper>
  );
}
