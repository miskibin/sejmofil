import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface Quote {
  author: string;
  quote: string;
  image: string;
}

export default function PoliticianQuotes() {
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
    {
      author: "Leo Varadkar",
      quote: "I enjoy finding common ground with different",
      image: "/placeholder.svg?height=48&width=48",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <span className="text-sm text-[#8B1538]">Ciekawostki</span>
          <CardTitle>Cytaty</CardTitle>
        </div>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">20 Nov</span>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <p className="text-sm text-[#8B1538]">{quote.author}</p>
              <p className="text-sm font-medium">{quote.quote}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
          <span>20/12/2024</span>
        </div>
      </CardContent>
    </Card>
  );
}
