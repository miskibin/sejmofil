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
    {
      id: "05",
      title:
        "Dostęp do antykoncepcji: rządowy projekt pod lupą Komisji Zdrowia",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "04",
      title:
        "Poseł Grzegorz Gaża przed komisją: co dalej z wnioskiem o uchylenie immunitetu?",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "412",
      title:
        "Immunitet poselski Joanny Scheuring-Wielgus: komisja odrzuca wniosek policji",
      date: "04 Dec 2024",
      category: "Obrady",
    },
    {
      id: "385",
      title:
        "Nowe plany adaptacji do zmian klimatu: obowiązek dla miast powyżej 20 tysięcy mieszkańców",
      date: "04 Dec 2024",
      category: "Obrady",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Newsy</CardTitle>
        <h2 className="text-2xl font-semibold">Gorące tematy</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        {news
          .map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex gap-3">
                <span className="text-xl font-bold text-primary">
                  {item.id}
                </span>
                <h3 className="text-lg font-medium">{item.title}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.date}, {item.category}
              </div>
            </div>
          ))
          .slice(0, 4)}
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
          <span>20/12/2024</span>
        </div>
      </CardContent>
    </Card>
  );
}
