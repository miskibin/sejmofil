import { Sparkles } from "lucide-react";
import Image from "next/image";
import { CardWrapper } from "@/components/ui/card-wrapper";

interface Politician {
  name: string;
  count: number;
  image: string;
}
const politicians: Politician[] = [
  {
    name: "Donald Tusk",
    count: 200,
    image: "https://api.sejm.gov.pl/sejm/term10/MP/123/photo",
  },
  {
    name: "Andrzej Motyka",
    count: 192,
    image: "https://api.sejm.gov.pl/sejm/term10/MP/113/photo",
  },
  {
    name: "Andrzej Motyka",
    count: 192,
    image: "https://api.sejm.gov.pl/sejm/term10/MP/143/photo",
  },
  {
    name: "Andrzej Motyka",
    count: 192,
    image: "https://api.sejm.gov.pl/sejm/term10/MP/143/photo",
  },
];

export default function PlebiscytCard() {
  return (
    <CardWrapper
      title="Plebiscyt"
      sourceDescription="Informacje wynikają z analizy AI oficjalnych danych sejmowych"
      sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
      aiPrompt="Give me a list of politicians who interrupted the most."
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
                <span className="">Przerwał </span>
                <span className="ms-2">{politician.count} razy</span>
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
