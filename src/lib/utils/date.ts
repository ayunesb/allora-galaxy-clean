
import { format, formatDistance } from 'date-fns';

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
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return formatter.format(dateObj);
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
