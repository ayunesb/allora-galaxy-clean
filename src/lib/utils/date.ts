
import { format } from 'date-fns';

/**
 * Format a date for database storage
 * @param date The date to format
 * @returns The formatted date string or undefined if date is null
 */
export const formatForDatabase = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

/**
 * Format a date for display in the UI
 * @param date The date (string or Date object) to format
 * @returns The formatted date string for display
 */
export const formatDisplayDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date in a relative way (e.g., "2 hours ago")
 * @param date The date (string or Date object) to format
 * @returns The formatted relative date string
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

/**
 * Get a date range for a specific period
 * @param period The time period to get a range for
 * @returns The date range
 */
export const getDateRangeForPeriod = (
  period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth'
): { from: Date; to: Date } => {
  const now = new Date();
  const from = new Date();
  const to = new Date();
  
  switch (period) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
      
    case 'yesterday':
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      to.setDate(to.getDate() - 1);
      to.setHours(23, 59, 59, 999);
      break;
      
    case 'last7days':
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
      
    case 'last30days':
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
      
    case 'thisMonth':
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
      
    case 'lastMonth':
      from.setMonth(from.getMonth() - 1);
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setDate(0); // Last day of previous month
      to.setHours(23, 59, 59, 999);
      break;
  }
  
  return { from, to };
};
