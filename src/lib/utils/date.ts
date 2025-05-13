
import { format, formatDistance, isDate } from "date-fns";

/**
 * Format a date relative to the current date
 * @param date The date to format
 * @returns A string representing the relative date
 */
export function formatRelative(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isDate(dateObj) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  try {
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (err) {
    console.error('Error formatting date:', err);
    return format(dateObj, 'PPP');
  }
}

/**
 * Format a date for database storage
 * @param date Date to format
 * @returns Formatted date string in ISO format
 */
export function formatForDatabase<T extends Date | null>(date: T): string | null {
  if (!date) return null;
  
  try {
    // Use toString() instead of direct indexing for the generic type
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date for database:', error);
    return null;
  }
}

/**
 * Format a date for display in the UI
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDisplayDate(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isDate(dateObj) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  try {
    return format(dateObj, 'PPP');
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}
