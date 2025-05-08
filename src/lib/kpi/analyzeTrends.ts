
import { format, subDays, parseISO } from 'date-fns';
import { KPITrend, TrendDirection } from '@/types/shared';

/**
 * Calculate the trend for a KPI
 * 
 * @param currentValue Current value of the KPI
 * @param previousValue Previous value of the KPI
 * @param higherIsBetter Whether a higher value is considered positive
 * @returns KPI trend analysis
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number,
  higherIsBetter: boolean = true
): KPITrend {
  // If no previous value, no trend
  if (previousValue === 0) {
    return {
      direction: 'neutral',
      percentage: 0,
      previousValue,
      isPositive: false
    };
  }
  
  // Calculate change percentage
  const difference = currentValue - previousValue;
  const percentage = Math.round((difference / Math.abs(previousValue)) * 100);
  
  // Determine direction
  let direction: TrendDirection = 'neutral';
  if (percentage > 0) {
    direction = 'up';
  } else if (percentage < 0) {
    direction = 'down';
  }
  
  // Determine if positive based on direction and higherIsBetter
  const isPositive = 
    (direction === 'up' && higherIsBetter) || 
    (direction === 'down' && !higherIsBetter);
  
  return {
    direction,
    percentage: Math.abs(percentage),
    previousValue,
    isPositive
  };
}

/**
 * Get formatted date range for KPI comparisons
 * 
 * @param days Number of days to look back
 * @returns Object with formatted date strings
 */
export function getDateRange(days: number = 30) {
  const today = new Date();
  const startDate = subDays(today, days);
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
    previousStartDate: format(subDays(startDate, days), 'yyyy-MM-dd'),
    previousEndDate: format(subDays(today, 1), 'yyyy-MM-dd')
  };
}

/**
 * Convert a date string to a formatted date for display
 * 
 * @param dateStr Date string to format
 * @param formatStr Format string for date-fns
 * @returns Formatted date string
 */
export function formatDateStr(dateStr: string, formatStr: string = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), formatStr);
  } catch (e) {
    return dateStr;
  }
}
