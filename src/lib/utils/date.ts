
import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Format a date into a readable string
 * @param date The date to format
 * @param formatString The format string to use
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, formatString = 'PP'): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date into a readable time
 * @param date The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string | number): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, 'p');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Format a date into a readable datetime
 * @param date The date to format
 * @returns Formatted datetime string
 */
export const formatDatetime = (date: Date | string | number): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, 'PPp');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid datetime';
  }
};

/**
 * Format a date as a relative time string
 * @param date The date to format
 * @param baseDate The base date to compare against (defaults to now)
 * @returns Relative date string
 */
export const formatRelativeDate = (date: Date | string | number, baseDate = new Date()): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for input elements
 * @param date The date to format
 * @returns Formatted date string for inputs
 */
export const formatDateForInput = (date: Date | string | number | null): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format a time for input elements
 * @param date The date to format
 * @returns Formatted time string for inputs
 */
export const formatTimeForInput = (date: Date | string | number | null): string => {
  try {
    if (!date) return '';
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return '';
  }
};

/**
 * Parse a date from an input element
 * @param dateString The date string to parse
 * @returns Parsed Date object
 */
export const parseDateFromInput = (dateString: string): Date | null => {
  try {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error parsing date from input:', error);
    return null;
  }
};
