
import { TrendDirection, KPITrend } from '@/types/shared';

/**
 * Analyzes trend direction based on current and previous values
 * @param currentValue Current metric value
 * @param previousValue Previous metric value
 * @param threshold Optional threshold for considering a change significant (default: 0)
 * @returns Trend direction ('up', 'down', or 'flat')
 */
export function analyzeTrendDirection(
  currentValue: number,
  previousValue: number | null | undefined,
  threshold: number = 0
): TrendDirection {
  if (previousValue === null || previousValue === undefined) {
    return 'flat';
  }

  const diff = currentValue - previousValue;
  
  if (Math.abs(diff) <= threshold) {
    return 'flat';
  }
  
  return diff > 0 ? 'up' : 'down';
}

/**
 * Calculates percentage change between current and previous values
 * @param currentValue Current metric value
 * @param previousValue Previous metric value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(
  currentValue: number,
  previousValue: number | null | undefined
): number {
  if (previousValue === null || previousValue === undefined || previousValue === 0) {
    return 0;
  }
  
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

/**
 * Analyzes KPI trend comprehensively
 * @param currentValue Current metric value
 * @param previousValue Previous metric value
 * @param threshold Optional threshold for considering a change significant (default: 0)
 * @returns KPITrend object with direction, percentage change and absolute change
 */
export function analyzeKpiTrend(
  currentValue: number,
  previousValue: number | null | undefined,
  threshold: number = 0
): KPITrend {
  const direction = analyzeTrendDirection(currentValue, previousValue, threshold);
  const percentage = calculatePercentageChange(currentValue, previousValue);
  const value = previousValue !== null && previousValue !== undefined 
    ? currentValue - previousValue 
    : 0;
    
  return {
    direction,
    percentage,
    value
  };
}

/**
 * Formats percentage change for display
 * @param percentage Percentage change value
 * @param precision Number of decimal places (default: 1)
 * @returns Formatted percentage string with + or - prefix
 */
export function formatPercentageChange(percentage: number, precision: number = 1): string {
  const prefix = percentage > 0 ? '+' : '';
  return `${prefix}${percentage.toFixed(precision)}%`;
}
