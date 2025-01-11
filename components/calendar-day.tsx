"use client";
import { useRouter } from "next/navigation";

interface ProceedingDates {
  proceeding_number: string;
  proceeding_dates: string[];
}

interface CalendarDayProps {
  date: number | null;
  isProceeding?: boolean;
  proceedingNumber?: string;
  isToday?: boolean;
  isAdjacentMonth?: boolean;
  fullDate?: string;
  proceeding_dates?: ProceedingDates[];
}

export default function CalendarDayTile({
  date,
  isProceeding,
  proceedingNumber,
  isToday,
  isAdjacentMonth,
  fullDate,
  proceeding_dates,
}: CalendarDayProps) {
  const router = useRouter();

  const handleClick = () => {
    if (fullDate && proceeding_dates) {
      const proceeding = proceeding_dates.find(p => 
        p.proceeding_dates.includes(fullDate)
      );

      if (proceeding) {
        router.push(`/proceedings/${proceeding.proceeding_number}`);
      }
    }
  };

  const shouldShowDate = isAdjacentMonth || isProceeding || isToday;

  return (
    <div
      onClick={handleClick}
      className={`relative aspect-square p-1 py-1 sm:px-2 rounded-lg flex items-start justify-start ${
        isProceeding && isToday
          ? "bg-primary border-b-[16px] border-gray-700 cursor-pointer"
          : isProceeding && proceedingNumber !== "0"
          ? "bg-primary cursor-pointer hover:opacity-90 after:content-[''] after:absolute after:left-2 after:right-2 after:h-[3px] after:bg-white after:bottom-2 after:rounded-full"
          : isProceeding
          ? "bg-primary cursor-pointer hover:opacity-90"
          : isToday
          ? "bg-gray-700"
          : "bg-gray-100"
      }`}
    >
      {shouldShowDate && (
        <span
          className={`${
            isProceeding || isToday
              ? "text-white"
              : isAdjacentMonth
              ? "text-gray-400"
              : "text-gray-700"
          } font-semibold z-10`}
        >
          {date}
        </span>
      )}
    </div>
  );
}
