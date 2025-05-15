
import { format, subDays, subMonths, subYears, parseISO as dateFnsParseISO } from 'date-fns';
import { DateRange } from '@/types/logs';

/**
 * Format a date to ISO string
 * @param date The date to format
 * @returns ISO 8601 formatted date string
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse an ISO date string to a Date object
 * @param isoDate ISO date string
 * @returns Date object
 */
export const parseISO = (isoDate: string): Date => {
  return dateFnsParseISO(isoDate);
};

/**
 * Format a date for display
 * @param date The date to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDateDisplay = (date: Date, formatStr: string = 'MMM d, yyyy'): string => {
  return format(date, formatStr);
};

/**
 * Get a date range for a specified time period
 * @param period Time period ('24h', '7d', '30d', '1y')
 * @returns Date range with from and to dates
 */
export const getDateRangeFromPeriod = (period: string): DateRange => {
  const now = new Date();
  let from: Date;
  
  switch (period) {
    case '24h':
      from = subDays(now, 1);
      break;
    case '7d':
      from = subDays(now, 7);
      break;
    case '30d':
      from = subDays(now, 30);
      break;
    case '1y':
      from = subYears(now, 1);
      break;
    default:
      from = subDays(now, 7); // Default to 7 days
  }
  
  return {
    from,
    to: now
  };
};

/**
 * Get a human-readable label for a time period
 * @param period Time period ('24h', '7d', '30d', '1y')
 * @returns Human-readable label
 */
export const getTimePeriodLabel = (period: string): string => {
  switch (period) {
    case '24h':
      return 'Last 24 hours';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '1y':
      return 'Last year';
    default:
      return 'Custom period';
  }
};

/**
 * Format a timestamp for display in logs/errors
 * @param timestamp ISO timestamp string
 * @returns Formatted timestamp string
 */
export const formatLogTimestamp = (timestamp: string): string => {
  return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
};

/**
 * Get a date range for recent errors (last 30 days by default)
 * @param days Number of days to look back
 * @returns Date range with from and to dates
 */
export const getRecentDateRange = (days: number = 30): DateRange => {
  const now = new Date();
  return {
    from: subDays(now, days),
    to: now
  };
};
