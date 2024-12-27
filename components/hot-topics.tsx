import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";

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
    <Card className="w-full h-full flex flex-col relative overflow-hidden">
      <CardHeader className="py-5 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-sm text-primary">Newsy</CardTitle>
          <h2 className="text-2xl font-semibold">Gorące tematy</h2>
        </div>
        <div className=" p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <hr className="border-t border-[1px] border-border mx-4" />
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
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
