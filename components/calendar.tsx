import { CardWrapper } from "@/components/ui/card-wrapper";
import CalendarDayTile from "./calendar-day";
import { getProceedingDates } from "@/lib/queries/proceeding";

interface ProceedingDates {
  proceeding_number: string;
  proceeding_dates: string[];
}

interface CalendarDay {
  date: number | null;
  isProceeding?: boolean;
  proceedingNumber?: string;
  isToday?: boolean;
  isAdjacentMonth?: boolean;
  fullDate?: string;
  proceeding_dates: ProceedingDates[];
  isFutureDate?: boolean;
}

export default async function SessionCalendar() {
  const weekDays = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sb"];
  const proceedings = await getProceedingDates();
  const today = new Date();

  // Get first day of current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Get last day of current month
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Get the day of week for first day (0-6)
  const firstDayWeekday = firstDayOfMonth.getDay();
  // Adjust for Monday start (0 becomes 6, otherwise subtract 1)

  const calendarDays: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  const isFutureDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    return date > today;
  };

  // Add days from previous month
  const prevMonthLastDay = new Date(firstDayOfMonth);
  prevMonthLastDay.setDate(0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = new Date(prevMonthLastDay);
    date.setDate(prevMonthLastDay.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const proceedingForDay = proceedings.find((p) =>
      p.proceeding_dates.includes(dateStr)
    );

    currentWeek.push({
      date: date.getDate(),
      isProceeding: !!proceedingForDay,
      proceedingNumber: proceedingForDay?.proceeding_number,
      isAdjacentMonth: true,
      fullDate: dateStr,
      isFutureDate: isFutureDate(dateStr),
      proceeding_dates: proceedings,
    });
  }

  // Add days from current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), day));
    const dateStr = date.toISOString().split("T")[0];
    const proceedingForDay = proceedings.find((p) =>
      p.proceeding_dates.includes(dateStr)
    );
    currentWeek.push({
      date: date.getUTCDate(),
      isProceeding: !!proceedingForDay,
      proceedingNumber: proceedingForDay?.proceeding_number,
      isToday: day === today.getDate(),
      fullDate: dateStr,
      isFutureDate: isFutureDate(dateStr),
      proceeding_dates: proceedings,
    });

    if (currentWeek.length === 7) {
      calendarDays.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add days from next month
  let nextMonthDay = 1;
  while (currentWeek.length < 7) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      nextMonthDay
    );
    const dateStr = date.toISOString().split("T")[0];
    const proceedingForDay = proceedings.find((p) =>
      p.proceeding_dates.includes(dateStr)
    );

    currentWeek.push({
      date: nextMonthDay,
      isProceeding: !!proceedingForDay,
      proceedingNumber: proceedingForDay?.proceeding_number,
      isAdjacentMonth: true,
      fullDate: dateStr,
      isFutureDate: isFutureDate(dateStr),
      proceeding_dates: proceedings,
    });
    nextMonthDay++;
  }
  calendarDays.push(currentWeek);

  return (
    <CardWrapper
      title="Kalendarz obrad"
      className="h-full"
      sourceDescription="Oficjalne api sejmu RP"
      showMoreLink="/proceedings"
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
    >
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium px-2 my-1 rounded-full bg-gray-50"
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
