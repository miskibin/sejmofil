import { ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
    <Card className="w-full h-full flex flex-col relative overflow-hidden">
      <CardHeader className="py-5 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-sm text-primary">Plebiscyt</CardTitle>
          <h2 className="text-2xl font-semibold">Czy wiesz, że?</h2>
        </div>
        <div className=" p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <hr className="border-t border-[1px] border-border mx-4" />
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4 ">
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
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent" />
        <div className="relative flex items-center justify-between pt-4 text-sm text-muted-foreground z-10">
        <button className="border rounded-full p-1 px-3 flex items-center space-x-1 transition-colors">
            <span>źródło</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="border rounded-full p-1 px-3">
            <span>20/12/2024</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
