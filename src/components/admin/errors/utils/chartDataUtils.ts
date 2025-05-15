
import { SystemLog, ErrorTrendDataPoint } from "@/types/logs";
import { addDays, format, isAfter, isBefore, parse, parseISO, startOfDay } from "date-fns";

/**
 * Prepare data for error trend charts from system logs
 * 
 * @param logs System logs to analyze
 * @param dateRange Optional date range to filter logs
 * @returns Array of data points for charts
 */
export const prepareErrorTrendsData = (
  logs: SystemLog[],
  dateRange?: { from: Date; to: Date | undefined }
): ErrorTrendDataPoint[] => {
  // First filter logs by date range if provided
  let filteredLogs = [...logs];
  if (dateRange) {
    filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.created_at);
      const isAfterStart = isAfter(logDate, startOfDay(dateRange.from));
      const isBeforeEnd = dateRange.to 
        ? isBefore(logDate, addDays(startOfDay(dateRange.to), 1))
        : true;
      return isAfterStart && isBeforeEnd;
    });
  }

  // Filter to only include error logs
  const errorLogs = filteredLogs.filter(log => log.level === 'error');
  
  // Group logs by date
  const logsByDate: Record<string, SystemLog[]> = {};
  
  errorLogs.forEach(log => {
    try {
      // Format date as YYYY-MM-DD
      const dateStr = format(new Date(log.created_at), 'yyyy-MM-dd');
      
      if (!logsByDate[dateStr]) {
        logsByDate[dateStr] = [];
      }
      
      logsByDate[dateStr].push(log);
    } catch (e) {
      console.error('Error parsing date:', log.created_at, e);
    }
  });
  
  // Create a series of dates within the range
  let startDate = dateRange?.from || (
    logs.length > 0 
      ? new Date(Math.min(...logs.map(log => new Date(log.created_at).getTime()))) 
      : new Date()
  );
  
  let endDate = dateRange?.to || (
    logs.length > 0 
      ? new Date(Math.max(...logs.map(log => new Date(log.created_at).getTime()))) 
      : new Date()
  );
  
  // Ensure we have at least today's date if no logs
  if (logs.length === 0) {
    startDate = startOfDay(new Date());
    endDate = startOfDay(new Date());
  }
  
  // Generate all dates in the range
  const dates: Date[] = [];
  let currentDate = startOfDay(startDate);
  const lastDate = startOfDay(endDate);
  
  while (currentDate <= lastDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  
  // Create data points for each date
  const dataPoints: ErrorTrendDataPoint[] = dates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const logsForDate = logsByDate[dateStr] || [];
    const total = logsForDate.length;
    
    // Count by severity
    const critical = logsForDate.filter(log => log.severity === 'critical').length;
    const high = logsForDate.filter(log => log.severity === 'high').length;
    const medium = logsForDate.filter(log => log.severity === 'medium').length;
    const low = logsForDate.filter(log => log.severity === 'low' || !log.severity).length;
    
    return {
      date: dateStr,
      count: total,
      total: filteredLogs.filter(log => format(new Date(log.created_at), 'yyyy-MM-dd') === dateStr).length,
      critical,
      high,
      medium,
      low
    };
  });
  
  return dataPoints;
};

/**
 * Calculate error rate as percentage of total logs
 * 
 * @param dataPoints Chart data points
 * @returns Array of data points with error rates
 */
export const calculateErrorRates = (
  dataPoints: ErrorTrendDataPoint[]
): (ErrorTrendDataPoint & { rate: number })[] => {
  return dataPoints.map(point => ({
    ...point,
    rate: point.total > 0 ? (point.count / point.total) * 100 : 0
  }));
};

/**
 * Group error logs by common attributes like message or module
 * 
 * @param logs System logs to group
 * @param attribute Attribute to group by
 * @returns Grouped logs with count and first/last seen dates
 */
export const groupErrorsByAttribute = (
  logs: SystemLog[],
  attribute: keyof SystemLog = 'message'
) => {
  const groups: Record<string, {
    logs: SystemLog[];
    count: number;
    firstSeen: string;
    lastSeen: string;
  }> = {};
  
  logs.forEach(log => {
    const key = String(log[attribute] || 'Unknown');
    
    if (!groups[key]) {
      groups[key] = {
        logs: [],
        count: 0,
        firstSeen: log.created_at,
        lastSeen: log.created_at
      };
    }
    
    groups[key].logs.push(log);
    groups[key].count++;
    
    // Update first/last seen
    if (new Date(log.created_at) < new Date(groups[key].firstSeen)) {
      groups[key].firstSeen = log.created_at;
    }
    
    if (new Date(log.created_at) > new Date(groups[key].lastSeen)) {
      groups[key].lastSeen = log.created_at;
    }
  });
  
  return Object.entries(groups).map(([key, group]) => ({
    key,
    ...group
  }));
};
