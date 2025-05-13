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
 * Format a date for display in the UI
 * @param dateString The date string to format
 * @returns Formatted date string for display
 */
export function formatDisplayDate(date?: Date | string | null): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return format(dateObj, 'PPP');
  } catch (error) {
    console.error('Error formatting display date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date for database storage
 * @param date Date to format
 * @returns Formatted date string in ISO format
 */
export function formatForDatabase(date: Date | null): string | null {
  if (!date) return null;
  
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date for database:', error);
    return null;
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

/**
 * Get a date with time set to the start of the day
 * @param date The date to modify
 * @returns Date with time set to 00:00:00
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get a date with time set to the end of the day
 * @param date The date to modify
 * @returns Date with time set to 23:59:59
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Format object dates based on a filter
 * @param obj Object containing dates to format
 * @param dateFields Fields to format as dates
 * @param formatString Format string for the dates
 * @returns New object with formatted dates
 */
export function formatObjectDates<T extends Record<string, any>>(
  obj: T,
  dateFields: string[],
  formatString: string = 'PPP'
): T {
  if (!obj) return obj;

  const result = { ...obj } as T;
  
  for (const field of dateFields) {
    if (obj[field]) {
      result[field as keyof T] = formatDate(obj[field], formatString) as any;
    }
  }
  
  return result;
}
