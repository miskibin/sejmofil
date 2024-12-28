import { CardWrapper } from "@/components/ui/card-wrapper";
import { Sparkles } from "lucide-react";
import Image from "next/image";
interface Statistic {
  type: "interruptions" | "speeches" | "manipulation" | "comments";
  value: number;
  displayText: string;
}

interface Politician {
  name: string;
  mainStat: Statistic;
  image: string;
}

const politicians: Politician[] = [
  {
    name: "Donald Tusk",
    mainStat: {
      type: "speeches",
      value: 250,
      displayText: "Przemawiał 250 razy",
    },
    image: "https://api.sejm.gov.pl/sejm/term10/MP/123/photo",
  },
  {
    name: "Andrzej Motyka",
    mainStat: {
      type: "manipulation",
      value: 90,
      displayText: "Kłamał 90 razy",
    },
    image: "https://api.sejm.gov.pl/sejm/term10/MP/113/photo",
  },
  {
    name: "Sławomir Mentzen",
    mainStat: {
      type: "comments",
      value: 4,
      displayText: "Wypowiedział się 4 razy",
    },
    image: "https://api.sejm.gov.pl/sejm/term10/MP/143/photo",
  },
  {
    name: "Mateusz Morawiecki",
    mainStat: {
      type: "interruptions",
      value: 250,
      displayText: "Przerwał 250 razy",
    },
    image: "https://api.sejm.gov.pl/sejm/term10/MP/143/photo",
  },
];

export default function PlebiscytCard() {
  return (
    <CardWrapper
      title="Rekordziści 10 kadencji"
      className="h-full"
      sourceDescription="Informacje wynikają z analizy AI oficjalnych danych sejmowych"
      sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
      aiPrompt="Give me interesting statistics about politicians."
      subtitle="Czy wiesz, że?"
      headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4 py-4">
        {politicians.map((politician, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">
                {politician.name}
              </p>
              <div className="flex flex-row text-xl font-normal leading-tight">
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
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
