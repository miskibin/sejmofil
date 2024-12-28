import { CardWrapper } from "@/components/ui/card-wrapper";
import { Check } from "lucide-react";

interface Point {
  title: string;
  amendment: string;
  status: "positive" | "negative";
}

export default function RecentPoints() {
  const points: Point[] = [
    {
      title: "Projekt ustawy budżetowej na rok 2025",
      amendment: "Sprawozdanie Komisji Finansów Publicznych",
      status: "positive",
    },
    {
      title: "Zmiana ustawy o rachunkowości i firmach audytorskich",
      amendment: "Sprawozdanie Komisji Finansów Publicznych",
      status: "positive",
    },
    {
      title: "Pociągnięcie posła Kaczyńskiego do odpowiedzialności karnej",
      amendment: "Sprawozdanie Komisji Regulaminowej, Spraw Poselskich i Immunitetowych",
      status: "negative",
    },
    {
      title: "Zmiana ustawy o dniach wolnych od pracy",
      amendment: "Sprawozdanie Komisji Gospodarki i Rozwoju oraz Komisji Polityki Społecznej i Rodziny",
      status: "positive",
    },
    {
      title: "Zmiana ustawy o świadczeniach opieki zdrowotnej",
      amendment: "Sprawozdanie Komisji Finansów Publicznych oraz Komisji Zdrowia",
      status: "positive",
    },
  ];
    return (
    <CardWrapper title="ostatnie posiedzenie" subtitle="Omawiane punkty">
      <div className="space-y-5 py-4">
        {points.map((vote, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-3 items-start">
              <div
                className={`min-w-9 min-h-9 w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-white`}
              >
                {vote.status === "positive" ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-xl  font-normal leading-tight">
                  {vote.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vote.amendment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
