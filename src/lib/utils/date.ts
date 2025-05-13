
import { format, formatDistance, formatRelative as fpFormatRelative } from 'date-fns';

// Format a date for display (human readable format)
export const formatDisplayDate = (
  date: Date | string | null | undefined,
  formatStr = 'MMM dd, yyyy HH:mm:ss'
): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch (err) {
    console.error('Date format error:', err);
    return String(date);
  }
};

// Format a date for relative display (e.g., "2 hours ago")
export const formatRelativeDate = (
  date: Date | string | null | undefined,
  baseDate: Date = new Date()
): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (err) {
    console.error('Relative date format error:', err);
    return String(date);
  }
};

// Format a date for database operations (ISO format)
export const formatForDatabase = (
  date: Date | null | undefined
): string | null => {
  if (!date) return null;
  try {
    return date.toISOString();
  } catch (err) {
    console.error('Database date format error:', err);
    return null;
  }
};

// Parse a string date into a Date object
export const parseDate = (dateStr: string): Date | null => {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (err) {
    console.error('Date parsing error:', err);
    return null;
  }
};
