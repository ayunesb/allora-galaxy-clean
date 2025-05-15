
import { format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import type { SystemLog } from '@/types/logs';

/**
 * Prepares chart data from system logs based on a date range
 */
export function prepareErrorTrendsData(logs: SystemLog[], dateRange: { from: Date; to: Date | undefined }) {
  if (!dateRange.to) return [];
  
  // Generate all days in the range
  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to
  });
  
  // Prepare data for each day
  return days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayFormatted = format(day, 'MMM dd');
    
    // Filter logs for this day
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= dayStart && logDate <= dayEnd;
    });
    
    // Count errors by severity (using level as fallback)
    const criticalCount = dayLogs.filter(log => 
      (log.severity === 'critical' || (log.level === 'error' && (!log.severity || log.severity === 'critical')))
    ).length;
    
    const highCount = dayLogs.filter(log => 
      (log.severity === 'high' || (log.level === 'error' && (!log.severity || log.severity === 'high')))
    ).length;
    
    const mediumCount = dayLogs.filter(log => 
      (log.severity === 'medium' || (log.level === 'warning' && (!log.severity || log.severity === 'medium')))
    ).length;
    
    const lowCount = dayLogs.filter(log => 
      (log.severity === 'low' || (log.level === 'info' && (!log.severity || log.severity === 'low')))
    ).length;
    
    // Count error types - using error_type or level as fallback
    const errorTypes: Record<string, number> = {};
    dayLogs.forEach(log => {
      // Use optional chaining to safely access error_type
      const errorType = log.error_type || log.level || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    // Get top error types
    const topErrorTypes = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>);
    
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
