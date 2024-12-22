import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Session {
  title: string;
  commission: string;
  status: "in-progress" | "completed";
}

export default function CommissionSessions() {
  const sessions: Session[] = [
    {
      title: "Wypłacanie odszkodowań ofiarą powodzi",
      commission: "Komisja do Spraw Powodzi",
      status: "in-progress",
    },
    {
      title: "Usuwania pieniędzy",
      commission: "Komisja do Spraw Powodzi",
      status: "in-progress",
    },
    {
      title: "Pegasus to konsola",
      commission: "Komisja do Spraw Podsłuchu",
      status: "completed",
    },
    {
      title: "Tiktok to rolki instagram random",
      commission: "Komisja do Spraw Podsłuchu",
      status: "completed",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Monitor</CardTitle>
        <h2 className="text-2xl font-semibold">Posiedzenia komisji</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex gap-3 py-2">
            <div
              className={`w-1 self-stretch rounded ${
                session.status === "in-progress"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">{session.title}</p>
              <p className="text-sm text-muted-foreground">
                {session.commission}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />W trakcie
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Zakonczone
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
          <span>20/12/2024</span>
        </div>
      </CardContent>
    </Card>
  );
}
