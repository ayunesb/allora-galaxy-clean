
import { SystemLog } from '@/types/logs';
import { 
  generateDateRange, 
  formatDay, 
  getDayStart, 
  getDayEnd, 
  isDateInDay 
} from './dateUtils';
import { 
  countLogsBySeverity, 
  countLogsByErrorType, 
  getTopErrorTypes 
} from './severityUtils';

/**
 * Prepares chart data from system logs based on a date range
 */
export function prepareErrorTrendsData(logs: SystemLog[], dateRange: { from: Date; to: Date | undefined }) {
  if (!dateRange.to) return [];
  
  // Generate all days in the range
  const days = generateDateRange(dateRange);
  
  // Prepare data for each day
  return days.map(day => {
    const dayStart = getDayStart(day);
    const dayEnd = getDayEnd(day);
    const dayFormatted = formatDay(day);
    
    // Filter logs for this day
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return isDateInDay(logDate, dayStart, dayEnd);
    });
    
    // Count errors by severity
    const { criticalCount, highCount, mediumCount, lowCount } = countLogsBySeverity(dayLogs);
    
    // Count error types and get top ones
    const errorTypes = countLogsByErrorType(dayLogs);
    const topErrorTypes = getTopErrorTypes(errorTypes);
    
    return {
      date: dayFormatted,
      total: dayLogs.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      ...topErrorTypes
    };
  });
}
