import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(
  text: string,
  maxLength: number,
  showDots = false
) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + (showDots ? "..." : "");
}
