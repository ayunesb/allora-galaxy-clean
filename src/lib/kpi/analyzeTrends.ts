
import { TrendDirection } from '@/types/shared';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  raw_change: number;
}

/**
 * Calculate trends based on current and previous KPI values
 * @param current The current KPI value
 * @param previous The previous KPI value
 * @returns Trend information including direction and percentage change
 */
export function calculateTrend(current: number, previous: number | null | undefined): KPITrend {
  if (previous === null || previous === undefined || previous === 0) {
    return {
      direction: 'neutral',
      percentage: 0,
      raw_change: 0
    };
  }

  const raw_change = current - previous;
  const percentage = (raw_change / Math.abs(previous)) * 100;
  
  // Determine direction with a small threshold to avoid noise
  const threshold = 0.5; // 0.5% change threshold for direction
  let direction: TrendDirection = 'flat';
  
  if (Math.abs(percentage) >= threshold) {
    direction = raw_change > 0 ? 'up' : 'down';
  }

  return {
    direction,
    percentage: Math.abs(Number(percentage.toFixed(1))),
    raw_change
  };
}

/**
 * Format a trend for display
 * @param trend The KPI trend
 * @param includePlus Whether to include a plus sign for positive trends
 * @returns Formatted trend string
 */
export function formatTrend(trend: KPITrend, includePlus: boolean = true): string {
  if (trend.direction === 'neutral' || trend.direction === 'flat' || trend.percentage === 0) {
    return '0%';
  }
  
  const prefix = trend.direction === 'up' && includePlus ? '+' : '';
  const sign = trend.direction === 'down' ? '-' : '';
  
  return `${prefix}${sign}${trend.percentage}%`;
}
