
import { KPITrend, TrendDirection } from '@/types/shared';

/**
 * Analyzes KPI data to determine trends
 * 
 * @param currentValue The current KPI value
 * @param previousValue The previous KPI value
 * @returns KPI trend analysis with direction and percentage change
 */
export function analyzeTrend(currentValue: number, previousValue: number | null | undefined): KPITrend {
  if (previousValue === null || previousValue === undefined) {
    return {
      change: 0,
      direction: 'flat',
      percentage: 0,
      isPositive: false
    };
  }

  if (previousValue === 0 && currentValue > 0) {
    return {
      change: currentValue,
      direction: 'up',
      percentage: 100,
      isPositive: true
    };
  } else if (previousValue === 0 && currentValue < 0) {
    return {
      change: currentValue,
      direction: 'down',
      percentage: 100,
      isPositive: false
    };
  } else if (previousValue === 0 && currentValue === 0) {
    return {
      change: 0,
      direction: 'flat',
      percentage: 0,
      isPositive: true
    };
  }

  const change = currentValue - previousValue;
  const percentage = Math.abs(Math.round((change / Math.abs(previousValue)) * 100));
  const direction: TrendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const isPositive = (direction === 'up' && previousValue >= 0) || (direction === 'down' && previousValue < 0);

  return {
    change,
    direction,
    percentage,
    isPositive
  };
}
