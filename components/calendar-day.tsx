'use client'
import { useRouter } from 'next/navigation'

interface ProceedingDates {
  proceeding_number: string
  proceeding_dates: string[]
}

interface CalendarDayProps {
  date: number | null
  isProceeding?: boolean
  proceedingNumber?: string
  isToday?: boolean
  isAdjacentMonth?: boolean
  fullDate?: string
  proceeding_dates?: ProceedingDates[]
  isFutureDate?: boolean
}

export default function CalendarDayTile({
  date,
  isProceeding,
  proceedingNumber,
  isToday,
  isAdjacentMonth,
  fullDate,
  proceeding_dates,
  isFutureDate,
}: CalendarDayProps) {
  const router = useRouter()

  const handleClick = () => {
    if (isFutureDate) return
    if (fullDate && proceeding_dates) {
      const proceeding = proceeding_dates.find((p) =>
        p.proceeding_dates.includes(fullDate)
      )

      if (proceeding) {
        router.push(`/proceedings/${proceeding.proceeding_number}`)
      }
    }
  }

  const shouldShowDate = isAdjacentMonth || isProceeding || isToday

  return (
    <div
      onClick={handleClick}
      className={`relative flex aspect-square items-start justify-start rounded-lg p-1 py-1 sm:px-2 ${
        isProceeding && isToday
          ? 'cursor-pointer border-b-[16px] border-gray-700 bg-primary'
          : isProceeding && proceedingNumber !== '0'
            ? "cursor-pointer bg-primary after:absolute after:bottom-2 after:left-2 after:right-2 after:h-[3px] after:rounded-full after:bg-white after:content-[''] hover:opacity-90"
            : isProceeding
              ? 'cursor-pointer bg-primary hover:opacity-90'
              : isToday
                ? 'bg-gray-700'
                : 'bg-gray-100'
      } ${isFutureDate && '!cursor-not-allowed opacity-80'}`}
    >
      {shouldShowDate && (
        <span
          className={`${
            isProceeding || isToday
              ? 'text-white'
              : isAdjacentMonth
                ? 'text-gray-400'
                : 'text-gray-700'
          } z-10 font-semibold`}
        >
          {date}
        </span>
      )}
    </div>
  )
}
