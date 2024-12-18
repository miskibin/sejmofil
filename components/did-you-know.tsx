import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface PoliticianStat {
  name: string;
  count: number;
  image: string;
}

export default function DidYouKnow() {
  const politicians: PoliticianStat[] = [
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
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-[#8B1538]">
          Plebiscyt - Polityków
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <div className="space-y-3">
          {politicians.map((politician, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-[#8B1538]">{politician.name}</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-md font-semibold">Przerwał</span>
                  <span className="text-md font-bold">
                    {politician.count} razy
                  </span>
                </div>
              </div>
              <Image
                src={politician.image}
                alt={politician.name}
                width={50}
                height={50}
                className="rounded-md"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
          <span>20/12/2024</span>
        </div>
      </CardContent>
    </Card>
  );
}
