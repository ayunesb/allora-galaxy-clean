
import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a human readable format
 * @param dateString ISO date string
 * @param formatString Optional format string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatString: string = 'MMM d, yyyy HH:mm:ss'): string => {
  try {
    return format(parseISO(dateString), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format date range between two dates
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string, endDate?: string): string => {
  const start = format(parseISO(startDate), 'MMM d, yyyy');
  
  if (!endDate) {
    return start;
  }
  
  const end = format(parseISO(endDate), 'MMM d, yyyy');
  return `${start} - ${end}`;
};
