import { CardWrapper } from "@/components/ui/card-wrapper";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface Quote {
  author: string;
  quote: string;
  image: string;
}

const quotes: Quote[] = [
  {
    author: "Donald Tusk",
    quote: "Będę kradł ile mogę dla demokracji",
    image: "https://api.sejm.gov.pl/sejm/term10/MP/123/photo",
  },
  {
    author: "Andrzej Duda",
    quote: "Lubię podpisywać ustawy",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    author: "Angela Merkel",
    quote: "Ich liebe es, in der Politik zu sein",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    author: "Emmanuel Macron",
    quote: "J'adore travailler avec d'autres pays",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    author: "Klaus Iohannis",
    quote: "Îmi place să colaborez cu ceilalți lideri",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    author: "Giuseppe Conte",
    quote: "Mi piace lavorare con gli altri politici",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    author: "Pedro Sánchez",
    quote: "Me encanta discutir con otros políticos",
    image: "/placeholder.svg?height=48&width=48",
  },
];

export default function PoliticianQuotes() {
  return (
    <CardWrapper
      title="Ciekawostki"
      subtitle="Cytaty"
      headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        {quotes.map((quote, index) => (
          <div key={index} className="flex items-center gap-4">
            <Image
              src={`https://api.sejm.gov.pl/sejm/term10/MP/${index + 2}/photo`}
              alt={quote.author}
              width={48}
              height={48}
              className="rounded-md"
            />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-primary">{quote.author}</p>
              <p className="text-xl font-normal leading-tight">{quote.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
