import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Vote {
  title: string;
  amendment: string;
  status: "positive" | "negative";
}

export default function RecentVotes() {
  const votes: Vote[] = [
    {
      title:
        "Ustawa o zadość uczynieniu poszkodowanym w wyniku wypadku samochodowego",
      amendment: "Poprawka 4",
      status: "positive",
    },
    {
      title: "Ustawa o dostępnej pigułce na ból głowy na życzenie",
      amendment: "Poprawka 4",
      status: "negative",
    },
    {
      title: "Ustawa o ochronie praw zwierząt w schroniskach",
      amendment: "Poprawka 7",
      status: "positive",
    },
    {
      title: "Ustawa o zwiększeniu dostępności opieki zdrowotnej",
      amendment: "Poprawka 7",
      status: "negative",
    },
    {
      title: "Ustawa o wsparciu edukacji publicznej",
      amendment: "Poprawka 7",
      status: "positive",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-[#8B1538]">🧂 Newsy</CardTitle>
        <h2 className="text-2xl font-semibold">Ostatnie głosowania</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        {votes.map((vote, index) => (
          <div key={index} className="flex gap-3">
            <div
              className={`w-1 self-stretch rounded ${
                vote.status === "positive" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">{vote.title}</p>
              <p className="text-sm text-muted-foreground">{vote.amendment}</p>
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
