import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Election {
  type: string;
  date: string;
}

export default function UpcomingElections() {
  const elections: Election[] = [
    {
      type: "Prezydenckie",
      date: "14 Maja 2024",
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
        <CardTitle className="text-sm text-[#8B1538]">wybory</CardTitle>
        <h2 className="text-2xl font-semibold">Nadchodzące wybory</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-6">
        <div className="space-y-4">
          {elections.map((election, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium">{election.type}</span>
              <span className="text-sm text-muted-foreground">
                {election.date}
              </span>
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
