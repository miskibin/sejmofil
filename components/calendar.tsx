import { CardWrapper } from "@/components/ui/card-wrapper";
import CalendarDayTile from "./calendar-day";
import { getProceedingDates } from "@/lib/queries/proceeding";

interface CalendarDay {
  date: number | null;
  isProceeding?: boolean;
  proceedingNumber?: string;
  isToday?: boolean;
}

export default async function SessionCalendar() {
  const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd"];
  const proceedings = await getProceedingDates();
  const today = new Date();

  // Calculate the middle of our 4-week view (2 weeks before, 2 weeks after)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 21);

  // Adjust to start from Monday
  const startDay = startDate.getDay();
  const diff = startDate.getDate() - startDay + (startDay === 0 ? -6 : 1);
  startDate.setDate(diff);

  const calendarDays: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Generate exactly 4 weeks (28 days)
  for (let i = 0; i < 35; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    const proceedingForDay = proceedings.find((p) =>
      p.proceeding_dates.includes(dateStr)
    );

    const isToday =
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    currentWeek.push({
      date: currentDate.getDate(),
      isProceeding: !!proceedingForDay,
      proceedingNumber: proceedingForDay?.proceeding_number,
      isToday,
    });

    if (currentWeek.length === 7) {
      calendarDays.push(currentWeek);
      currentWeek = [];
    }
  }

  return (
    <CardWrapper
      title="Kalendarz obrad"
      className="h-full"
      sourceDescription="Oficjalne api sejmu RP"
      sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
      subtitle={`${
        new Intl.DateTimeFormat("pl-PL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
          .format(today)
          .charAt(0)
          .toUpperCase() +
        new Intl.DateTimeFormat("pl-PL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
          .format(today)
          .slice(1)
      }`}
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
        {calendarDays.flat().map((day, index) => (
          <CalendarDayTile key={index} {...day} />
        ))}
      </div>
    </CardWrapper>
  );
}
