
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date string or Date object to a human-readable format
 * @param date Date string or Date object
 * @param formatString Format string for date-fns
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined, formatString: string = 'PPpp'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date string or Date object as a relative time
 * @param date Date string or Date object
 * @param addSuffix Whether to add "ago" suffix
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined, addSuffix: boolean = true): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Get a date range for filtering (e.g., last 7 days, last 30 days)
 * @param days Number of days to include in range
 * @returns Object with start and end dates
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  // Set start to beginning of day
  start.setHours(0, 0, 0, 0);
  
  // Set end to end of day
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Format a date for API request parameters (ISO format)
 * @param date Date to format
 * @returns ISO date string or null
 */
export function formatDateForApi(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Convert date strings in an object to Date objects
 * @param obj Object with date strings
 * @param dateFields Array of field names that contain dates
 * @returns New object with parsed dates
 */
export function parseDatesInObject<T extends Record<string, any>>(
  obj: T,
  dateFields: string[]
): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const field of dateFields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = parseISO(result[field]);
      } catch (error) {
        console.error(`Error parsing date field ${field}:`, error);
      }
    }
  }
  
  return result;
}
