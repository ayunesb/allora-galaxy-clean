
import { SystemLog, ErrorTrendDataPoint } from '@/types/logs';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';

/**
 * Prepares data for error trends charts from system logs
 * 
 * @param {SystemLog[]} logs - System logs to process
 * @param {Object} dateRange - Date range to filter logs
 * @param {Date} dateRange.from - Start date
 * @param {Date} [dateRange.to] - End date (defaults to now)
 * @returns {ErrorTrendDataPoint[]} Data points for charts
 */
export function prepareErrorTrendsData(
  logs: SystemLog[],
  dateRange: { from: Date; to?: Date }
): ErrorTrendDataPoint[] {
  const { from, to = new Date() } = dateRange;
  
  // Filter logs by date range
  const filteredLogs = logs.filter(log => {
    const logDate = parseISO(log.timestamp || log.created_at);
    return (isAfter(logDate, from) || isEqual(logDate, from)) && 
           (isBefore(logDate, to) || isEqual(logDate, to));
  });
  
  // Group by date
  const groupedByDate: Record<string, SystemLog[]> = {};
  
  filteredLogs.forEach(log => {
    const logDate = format(parseISO(log.timestamp || log.created_at), 'yyyy-MM-dd');
    if (!groupedByDate[logDate]) {
      groupedByDate[logDate] = [];
    }
    groupedByDate[logDate].push(log);
  });
  
  // Convert to chart data points
  const result: ErrorTrendDataPoint[] = Object.entries(groupedByDate).map(([date, dateLogs]) => {
    // Count by severity
    const critical = dateLogs.filter(log => log.severity === 'critical').length;
    const high = dateLogs.filter(log => log.severity === 'high').length;
    const medium = dateLogs.filter(log => log.severity === 'medium').length;
    const low = dateLogs.filter(log => log.severity === 'low').length;
    
    // Total errors (logs with error level)
    const total = dateLogs.filter(log => log.level === 'error').length;
    
    return {
      date,
      total,
      critical,
      high,
      medium,
      low
    };
  });
  
  // Sort by date
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
