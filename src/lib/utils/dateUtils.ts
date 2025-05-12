
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param formatString Optional format string
 * @returns Formatted date string
 */
export function formatDate(dateString?: string | null, formatString: string = 'yyyy-MM-dd HH:mm'): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date string to a relative format
 * @param dateString The date string to format
 * @param addSuffix Whether to add a suffix (e.g., "ago")
 * @returns Relative date string (e.g., "5 minutes ago")
 */
export function formatRelative(dateString?: string | null, addSuffix: boolean = true): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    
    return formatDistanceToNow(date, { addSuffix });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date range as a string
 * @param from Start date
 * @param to End date
 * @returns Formatted date range string
 */
export function formatDateRange(from?: Date | null, to?: Date | null): string {
  if (!from && !to) return 'Any time';
  if (from && !to) return `From ${format(from, 'PPP')}`;
  if (!from && to) return `Until ${format(to, 'PPP')}`;
  return `${format(from as Date, 'PPP')} - ${format(to as Date, 'PPP')}`;
}

/**
 * Parse a date string safely
 * @param dateString The date string to parse
 * @returns Date object or null if invalid
 */
export function safeParseDate(dateString?: string | null): Date | null {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}
