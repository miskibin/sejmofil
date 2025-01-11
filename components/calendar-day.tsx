"use client";
import { useRouter } from "next/navigation";

interface CalendarDayProps {
  date: number | null;
  isProceeding?: boolean;
  proceedingNumber?: string;
  isToday?: boolean;
}

export default function CalendarDayTile({
  date,
  isProceeding,
  proceedingNumber,
  isToday,
}: CalendarDayProps) {
  const router = useRouter();
  console.log(date, isProceeding, proceedingNumber, isToday);
  const handleClick = () => {
    if (proceedingNumber) {
      router.push(`/proceedings/${proceedingNumber}`);
    }
  };

  return (

      <div
        onClick={handleClick}
        className={`relative aspect-square p-1 py-1 sm:px-2 rounded-lg flex items-start justify-start ${
          isProceeding && isToday
        ? "bg-primary border-b-[16px] border-gray-700 cursor-pointer"
        : isProceeding
        ? "bg-primary cursor-pointer hover:opacity-90"
        : isToday
        ? "bg-[#2D3748]"
        : "bg-gray-100"
        }`}
      >
        {(isProceeding || isToday) && (
          <span
        className={`${
          isProceeding || isToday ? "text-white" : "text-gray-700"
        } font-semibold z-10`}
          >
        {date}
          </span>
        )}
      </div>
  );
}
