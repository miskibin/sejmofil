import { Sparkles } from "lucide-react";
import { CardWrapper } from "@/components/ui/card-wrapper";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
}

export default function HotTopics() {
  const news: NewsItem[] = [
    {
      id: "01",
      title: "Prokuratoria Generalna RP podsumowuje rok 2022: jakie są wyniki?",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "02",
      title:
        "Sprawozdanie o stanie mienia Skarbu Państwa: co wiemy o finansach publicznych?",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "03",
      title: "Burzliwa debata wokół aborcji: nowe projekty ustaw w Sejmie",
      date: "04 Dec 2024",
      category: "Obrady",
    },
  ];

  return (
    <CardWrapper
      title="Newsy"
      subtitle="Gorące tematy"
      headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-5 py-4">
        {news.slice(0, 4).map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex gap-3 items-center">
              <span className="font-semibold text-white flex items-center justify-center bg-primary min-w-10 min-h-10 w-10 h-10 text-center rounded-lg">
                {item.id}
              </span>
              <h3 className="text-xl">{item.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground pl-8">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
