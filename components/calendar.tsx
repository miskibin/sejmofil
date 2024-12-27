import { CardWrapper } from "@/components/ui/card-wrapper";

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
    ],
  ];

  return (
    <CardWrapper
      title="Plebiscyt"
      subtitle="Kalendarz obrad"
      showGradient={false}
      showDate={false}
    >
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium px-2 py-1 my-1 rounded-full bg-gray-50"
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
    </CardWrapper>
  );
}
