import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProceedingDates } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNextProceedingDate(proceedings: ProceedingDates[]): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = proceedings
    .flatMap(p => p.proceeding_dates)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  return allDates.find(date => date >= today) || null;
}

export function getTimeUntilNextProceeding(nextDate: Date | null): string {
  if (!nextDate) return "brak zaplanowanych obrad";
  
  const now = new Date();
  const diff = nextDate.getTime() - now.getTime();
  
  if (diff <= 0) return "trwa";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
}
