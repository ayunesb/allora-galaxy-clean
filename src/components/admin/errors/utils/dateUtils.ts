
import { format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

/**
 * Generates an array of days between two dates
 */
export function generateDateRange(dateRange: { from: Date; to: Date | undefined }): Date[] {
  if (!dateRange.to) return [];
  
  return eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to
  });
}

/**
 * Formats a date to a readable format (MMM dd)
 */
export function formatDay(day: Date): string {
  return format(day, 'MMM dd');
}

/**
 * Gets the start of a specific day
 */
export function getDayStart(day: Date): Date {
  return startOfDay(day);
}

/**
 * Gets the end of a specific day
 */
export function getDayEnd(day: Date): Date {
  return endOfDay(day);
}

/**
 * Checks if a date falls within a specific day
 */
export function isDateInDay(date: Date, dayStart: Date, dayEnd: Date): boolean {
  return date >= dayStart && date <= dayEnd;
}
