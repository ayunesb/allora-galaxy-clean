
import { format, parse, isValid, parseISO } from 'date-fns';

/**
 * Format a date with a specified format string
 * @param date The date to format
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export function formatDate(date: Date | null | undefined, formatStr = 'yyyy-MM-dd'): string {
  if (!date) return '';
  return format(date, formatStr);
}

/**
 * Format a date with a time component
 * @param date The date to format
 * @returns Formatted date string with time
 */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format a date for display in UI
 * @param date The date to format
 * @returns User-friendly formatted date
 */
export function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'PPP');
}

/**
 * Format a date for database insertion
 * @param date The date to format
 * @returns ISO formatted date string
 */
export function formatForDatabase(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Parse a date string with a specified format
 * @param dateStr Date string to parse
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateStr: string | null | undefined, formatStr = 'yyyy-MM-dd'): Date | null {
  if (!dateStr) return null;
  
  try {
    // Try parsing with the specified format
    const parsedDate = parse(dateStr, formatStr, new Date());
    if (isValid(parsedDate)) return parsedDate;
    
    // Try parsing as ISO date
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) return isoDate;
    
    // Failed to parse
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Safely parse a date string in ISO format
 * @param dateStr ISO date string
 * @returns Parsed Date object or null if invalid
 */
export function parseISODate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
}

/**
 * Convert a date object to a date string with specified format
 * @param obj Object containing date fields
 * @param fieldNames Names of date fields to convert
 * @returns New object with converted date fields
 */
export function convertDatesToStrings<T extends Record<string, any>>(
  obj: T,
  fieldNames: (keyof T)[]
): Record<string, any> {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const fieldName of fieldNames) {
    const value = obj[fieldName as string];
    if (value instanceof Date) {
      result[fieldName as string] = formatForDatabase(value);
    }
  }
  
  return result;
}
