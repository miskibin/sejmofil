import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Election {
  type: string;
  date: string;
  active?: boolean;
}

export default function UpcomingElections() {
  const elections: Election[] = [
    {
      type: "Prezydenckie",
      date: "14 Maja 2024",
      active: true,
    },
    {
      type: "Samorządowe",
      date: "około 2027 roku",
    },
    {
      type: "Europejskie",
      date: "około 2028 roku",
    },
    {
      type: "Parlamentarne",
      date: "około 2029 roku",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">wybory</CardTitle>
        <h2 className="text-2xl font-semibold">Nadchodzące wybory</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-[6px] top-3 bottom-3 w-[2px] bg-primary" />

          {elections.map((election, index) => (
            <div
              key={index}
              className="flex justify-between items-center relative pl-8"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 w-3.5 h-3.5 rounded-full border-2 ${
                  election.active
                    ? "bg-primary border-primary"
                    : "bg-white border-primary"
                }`}
              />

              <span className="  font-medium">
                {election.type}
              </span>
              <span className="">{election.date}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
          <span>Zobacz więcej</span>
        </div>
      </CardContent>
    </Card>
  );
}
