
import { SystemLog, ErrorTrendDataPoint } from '@/types/logs';

/**
 * Prepare error trends data for charts from system logs
 */
export function prepareErrorTrendsData(
  logs: SystemLog[],
  dateRange: { from: Date; to: Date | undefined }
): ErrorTrendDataPoint[] {
  // Filter logs to only include errors
  const errorLogs = logs.filter(log => log.level === 'error');
  
  // Format data for charts
  const trendData = formatErrorTrendData(errorLogs);
  
  // Filter by date range if provided
  return filterErrorTrendDataByDateRange(trendData, dateRange.from, dateRange.to);
}

/**
 * Format error data for recharts
 */
export function formatErrorTrendData(rawData: SystemLog[]): ErrorTrendDataPoint[] {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }
  
  // Group by date
  const dataByDate = rawData.reduce((acc: Record<string, any>, curr: SystemLog) => {
    const date = new Date(curr.timestamp).toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = {
        date,
        count: 0,
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };
    }
    
    acc[date].count += 1;
    acc[date].total += 1;
    
    // Increment severity counter
    const severity = curr.severity || 'low';
    if (severity === 'critical') acc[date].critical += 1;
    else if (severity === 'high') acc[date].high += 1;
    else if (severity === 'medium') acc[date].medium += 1;
    else acc[date].low += 1;
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  return Object.values(dataByDate)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) as ErrorTrendDataPoint[];
}

/**
 * Filter error trend data by date range
 */
export function filterErrorTrendDataByDateRange(
  data: ErrorTrendDataPoint[],
  startDate?: Date,
  endDate?: Date
): ErrorTrendDataPoint[] {
  if (!startDate && !endDate) return data;
  
  return data.filter(point => {
    const pointDate = new Date(point.date);
    
    if (startDate && pointDate < startDate) return false;
    if (endDate) {
      // Set end date to end of day for inclusive comparison
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (pointDate > endOfDay) return false;
    }
    
    return true;
  });
}
