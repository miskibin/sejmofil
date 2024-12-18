import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarDay {
  date: number | null;
  isHighlighted?: boolean;
  color?: "primary" | "secondary";
}

export default function SessionCalendar() {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const calendar: CalendarDay[][] = [
    [
      { date: null },
      { date: null },
      { date: 3, isHighlighted: true, color: "primary" },
      { date: null },
      { date: 5, isHighlighted: true, color: "secondary" },
      { date: null },
      { date: null },
    ],
    [
      { date: null },
      { date: null },
      { date: null },
      { date: 11, isHighlighted: true, color: "secondary" },
      { date: null },
      { date: null },
      { date: null },
    ],
    [
      { date: null },
      { date: null },
      { date: null },
      { date: null },
      { date: null },
      { date: null },
      { date: null },
    ],
    [
      { date: null },
      { date: 24, isHighlighted: true, color: "secondary" },
      { date: null },
      { date: null },
      { date: null },
      { date: null },
      { date: null },
    ],
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-[#8B1538]">Informacje</CardTitle>
        <h2 className="text-2xl font-semibold">Kalendarz obrad </h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium p-2 bg-gray-50 rounded"
            >
              {day}
            </div>
          ))}
          {calendar.flat().map((day, index) => (
            <div
              key={index}
              className={`aspect-square p-2 rounded flex items-center justify-center ${
                day?.isHighlighted
                  ? day.color === "secondary"
                    ? "bg-[#8B1538] text-white"
                    : "bg-[#2D3748] text-white"
                  : "bg-gray-100"
              }`}
            >
              {day?.date || ""}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">Zobacz więcej</div>
      </CardContent>
    </Card>
  );
}
