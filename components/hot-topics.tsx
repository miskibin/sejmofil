import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      title: "Donald Tusk Kradnie duże Mentzenowi",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "02",
      title: "Polska Upada przez brak Lecha Kaczyns",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "03",
      title: "Posłowie pojechali na wakacje do Duba",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "04",
      title: "Krzyk na sali sejmowej bo pan Jaruzels",
      date: "04 Dec 2024",
      category: "Obrady",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-[#8B1538]">Newsy</CardTitle>
        <h2 className="text-2xl font-semibold">Gorące tematy</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        {news.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex gap-3">
              <span className="text-xl font-bold text-[#8B1538]">
                {item.id}
              </span>
              <h3 className="text-lg font-medium">{item.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {item.date}, {item.category}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
          <span>20/12/2024</span>
        </div>
      </CardContent>
    </Card>
  );
}
