
import { format, parseISO, isValid, formatDistance } from 'date-fns';

/**
 * Format a date string or object to a standardized format
 * @param dateInput Date string or Date object
 * @param formatString Optional format string (defaults to 'yyyy-MM-dd HH:mm:ss')
 * @returns Formatted date string or 'Invalid date' if invalid
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  formatString: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!dateInput) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (typeof dateInput === 'string') {
      dateObj = parseISO(dateInput);
    } else {
      dateObj = dateInput;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 * @param dateInput Date string or Date object
 * @returns Relative time string or 'Invalid date' if invalid
 */
export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (typeof dateInput === 'string') {
      dateObj = parseISO(dateInput);
    } else {
      dateObj = dateInput;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Create a date range filter function
 * @param startDate Start date (inclusive)
 * @param endDate End date (inclusive)
 * @returns Filter function that checks if a date is within the range
 */
export function createDateRangeFilter(
  startDate: Date | null,
  endDate: Date | null
): (dateStr: string | Date | null | undefined) => boolean {
  return (dateStr: string | Date | null | undefined): boolean => {
    if (!dateStr) return false;
    
    try {
      let dateObj: Date;
      
      if (typeof dateStr === 'string') {
        dateObj = parseISO(dateStr);
      } else {
        dateObj = dateStr;
      }
      
      if (!isValid(dateObj)) {
        return false;
      }
      
      // Check if date is within range
      if (startDate && dateObj < startDate) {
        return false;
      }
      
      if (endDate) {
        // Set end date to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (dateObj > endOfDay) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in date range filter:', error);
      return false;
    }
  };
}
