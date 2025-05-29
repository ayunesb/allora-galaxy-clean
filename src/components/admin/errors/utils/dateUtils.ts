import {
  format,
  parseISO as parseDateISO,
  subDays,
  subHours,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { DateRange } from "@/types/logs";

/**
 * Format a date to ISO string format (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parse an ISO string to Date object
 * Re-exporting from date-fns for consistency
 */
export const parseISO = parseDateISO;

/**
 * Format a date to display format (MMM dd, yyyy)
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
}

/**
 * Get date range based on period string
 * Supports both legacy periods (today, yesterday, 7days, etc.)
 * and test-expected formats (24h, 7d, 30d, 1y)
 */
export function getDateRangeFromPeriod(period: string): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  // Handle test-expected formats first
  switch (period) {
    case "24h":
      return {
        from: subHours(now, 24),
        to: now,
      };
    case "7d":
      return {
        from: subDays(now, 7),
        to: now,
      };
    case "30d":
      return {
        from: subDays(now, 30),
        to: now,
      };
    case "1y":
      return {
        from: subDays(now, 365),
        to: now,
      };

    // Handle legacy formats
    case "today":
      return {
        from: today,
        to: endOfDay(now),
      };
    case "yesterday":
      const yesterday = subDays(today, 1);
      return {
        from: yesterday,
        to: endOfDay(yesterday),
      };
    case "7days":
      return {
        from: subDays(today, 7),
        to: endOfDay(now),
      };
    case "30days":
      return {
        from: subDays(today, 30),
        to: endOfDay(now),
      };
    case "90days":
      return {
        from: subDays(today, 90),
        to: endOfDay(now),
      };
    default:
      return {
        from: subDays(today, 7),
        to: endOfDay(now),
      };
  }
}

/**
 * Get a human-readable label for a time period
 */
export function getTimePeriodLabel(period: string): string {
  switch (period) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "7days":
    case "7d":
      return "Last 7 days";
    case "30days":
    case "30d":
      return "Last 30 days";
    case "90days":
      return "Last 90 days";
    case "24h":
      return "Last 24 hours";
    case "1y":
      return "Last year";
    default:
      return period;
  }
}

/**
 * Format a date range for display
 */
export function formatDateRange(range: DateRange): string {
  if (!range.from) return "All time";
  if (!range.to) return `Since ${formatDateDisplay(range.from)}`;

  return `${formatDateDisplay(range.from)} - ${formatDateDisplay(range.to)}`;
}
