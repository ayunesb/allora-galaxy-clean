
import { format, formatDistance, formatRelative } from 'date-fns';
import { zonedTimeToUtc, format as formatTZ } from 'date-fns-tz';

/**
 * Format a date for display
 */
export function formatDisplayDate(date: string | Date, formatStr = 'MMM d, yyyy HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Format a date for display with timezone
 */
export function formatDateWithTZ(
  date: string | Date, 
  formatStr = 'MMM d, yyyy HH:mm', 
  timeZone = 'UTC'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatTZ(zonedTimeToUtc(dateObj, timeZone), formatStr, { timeZone });
  } catch (error) {
    console.error('Error formatting date with timezone:', error);
    return String(date);
  }
}

/**
 * Format a date relative to now (e.g. "2 hours ago")
 */
export function formatRelativeDate(date: Date | string, baseDate = new Date()): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return String(date);
  }
}
