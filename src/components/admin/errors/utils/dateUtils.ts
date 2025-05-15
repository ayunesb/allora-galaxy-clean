
import { format, parse, parseISO as parseISOBase } from 'date-fns';

/**
 * Format a date to ISO format YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object
 */
export function parseISO(dateString: string): Date {
  return parseISOBase(dateString);
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Get date range from a time period string
 */
export function getDateRangeFromPeriod(period: string): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date();
  let from = new Date();

  switch (period) {
    case '24h':
      from.setHours(now.getHours() - 24);
      break;
    case '7d':
      from.setDate(now.getDate() - 7);
      break;
    case '30d':
      from.setDate(now.getDate() - 30);
      break;
    case '90d':
      from.setDate(now.getDate() - 90);
      break;
    default:
      // Default to 7 days
      from.setDate(now.getDate() - 7);
  }

  return { from, to };
}

/**
 * Get label for a time period
 */
export function getTimePeriodLabel(period: string): string {
  switch (period) {
    case '24h':
      return 'Last 24 hours';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    default:
      return 'Custom period';
  }
}

/**
 * Format date with time
 */
export function formatDate(date: Date | string, formatStr: string = 'PPp'): string {
  if (typeof date === 'string') {
    date = parseISOBase(date);
  }
  return format(date, formatStr);
}

/**
 * Get formatted date range
 */
export function formatDateRange(from: Date, to: Date): string {
  return `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`;
}

/**
 * Get date from days ago
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
