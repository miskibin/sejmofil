import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface CalendarDay {
  date: number | null;
  isHighlighted?: boolean;
  color?: "primary" | "secondary";
}

export default function SessionCalendar() {
  const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd"];

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
      <CardHeader className="py-5 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-sm text-primary">Plebiscyt</CardTitle>
          <h2 className="text-2xl font-semibold">Kalendarz obrad</h2>
        </div>
      </CardHeader>
      <hr className="border-t border-[1px] border-border mx-4 mb-4" />

      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium px-2 py-1 my-1 rounded-full bg-gray-50 "
            >
              {day}
            </div>
          ))}
          {calendar.flat().map((day, index) => (
            <div
              key={index}
              className={`aspect-square p-3 rounded flex items-center justify-center ${
                day?.isHighlighted
                  ? day.color === "secondary"
                    ? "bg-primary text-white"
                    : "bg-[#2D3748] text-white"
                  : "bg-gray-200"
              }`}
            >
              {day?.date || ""}
            </div>
          ))}
        </div>
        <div className="relative flex items-center justify-between pt-4 text-sm text-muted-foreground z-10">
        <button className="border rounded-full p-1 px-3 flex items-center space-x-1 transition-colors">
            <span>źródło</span>
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>
      </CardContent>
    </Card>
  );
}
