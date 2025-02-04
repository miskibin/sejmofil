import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ProceedingWithDetails } from './supabase/getProceedingDetails'
import { ProceedingDates } from './types/process'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text

export function getNextProceedingDate(
  proceedings: ProceedingDates[]
): Date | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allDates = proceedings
    .flatMap((p) => p.proceeding_dates)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime())

  return allDates.find((date) => date >= today) || null
}
export function getTimeUntilNextProceeding(nextDate: Date | null): string {
  if (!nextDate) return 'brak zaplanowanych obrad'

  const now = new Date()
  nextDate.setHours(9, 0, 0, 0) // Set proceeding start time to 9 AM
  const diff = nextDate.getTime() - now.getTime()

  if (diff <= 0) return '0'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${days}d ${hours}h ${minutes}m`
}

type PointType =
  ProceedingWithDetails['proceeding_day'][0]['proceeding_point_ai'][0]

export function calculatePointImportance(point: PointType) {
  return (
    (point.statements?.length || 0) +
    ((point.voting_numbers?.length || 0) > 0 ? 20 : 0)
  )
}

export function sortPointsByImportance<T extends PointType>(points: T[]): T[] {
  return [...points].sort(
    (a, b) => calculatePointImportance(b) - calculatePointImportance(a)
  )
}
