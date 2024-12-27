'use client';
import { useRouter } from "next/navigation";

interface CalendarDayProps {
  date: number | null;
  isProceeding?: boolean;
  proceedingNumber?: string;
  isToday?: boolean;
}

export default function CalendarDayTile({ date, isProceeding, proceedingNumber, isToday }: CalendarDayProps) {
  const router = useRouter();

  const handleClick = () => {
    if (proceedingNumber) {
      router.push(`/proceedings/${proceedingNumber}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`aspect-square p-3 rounded flex items-center justify-center ${
        isToday
          ? "bg-[#2D3748] text-white"
          : isProceeding
            ? "bg-primary text-white cursor-pointer hover:opacity-90"
            : "bg-gray-200"
      }`}
    >
      {(isProceeding || isToday) ? date : ''}
    </div>
  );
}
