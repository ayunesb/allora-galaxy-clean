
import { format, parse, formatDistance, formatRelative, parseISO } from 'date-fns';

/**
 * Format a date using the provided format string
 * @param date Date to format
 * @param formatString Format string
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatString: string = 'PP'
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Parse a date string using the provided format
 * @param dateString Date string to parse
 * @param formatString Format of the date string
 * @returns Parsed Date object
 */
export const parseDate = (
  dateString: string,
  formatString: string = 'yyyy-MM-dd'
): Date => {
  try {
    return parse(dateString, formatString, new Date());
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * Format a date as relative time (e.g., "5 minutes ago")
 * @param date Date to format
 * @param baseDate Base date to compare against
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (
  date: Date | string | null | undefined,
  baseDate: Date = new Date()
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Format a date relative to a base date (e.g., "yesterday", "last Friday")
 * @param date Date to format
 * @param baseDate Base date to compare against
 * @returns Formatted relative date string
 */
export const formatRelativeDate = (
  date: Date | string | null | undefined,
  baseDate: Date = new Date()
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatRelative(dateObj, baseDate);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Safely parse an ISO date string
 * @param dateString ISO date string to parse
 * @returns Date object or null if parsing fails
 */
export const parseISOSafe = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
};

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
  formatString: string = 'PP'
): T {
  if (!obj) return obj;

  const result = { ...obj };
  
  for (const field of dateFields) {
    if (obj[field]) {
      result[field] = formatDate(obj[field], formatString);
    }
  }
  
  return result;
}
