
import { KPI, KPITrend, TrendDirection } from '@/types/shared';

/**
 * Calculate the percentage change between two values
 * @param current The current value
 * @param previous The previous value
 * @returns The percentage change as a number
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Determine the trend direction based on percentage change
 * @param percentageChange The percentage change
 * @returns The trend direction
 */
export function determineTrendDirection(percentageChange: number): TrendDirection {
  if (percentageChange > 0) return 'up';
  if (percentageChange < 0) return 'down';
  return 'neutral';
}

/**
 * Process a KPI and calculate its trend information
 * @param kpi The KPI to analyze
 * @returns A KPI trend object
 */
export function analyzeKpiTrend(kpi: KPI): KPITrend {
  // If there's no previous value, we can't calculate a trend
  if (kpi.previous_value === null || kpi.previous_value === undefined) {
    return {
      currentValue: kpi.value,
      previousValue: 0,
      direction: 'neutral',
      percentageChange: 0,
      percentage: 0,
      isPositive: false
    };
  }

  const percentageChange = calculatePercentageChange(kpi.value, kpi.previous_value);
  const direction = determineTrendDirection(percentageChange);
  
  return {
    currentValue: kpi.value,
    previousValue: kpi.previous_value,
    direction,
    percentageChange,
    percentage: Math.abs(percentageChange),
    isPositive: direction === 'up'
  };
}

/**
 * Process multiple KPIs and calculate their trend information
 * @param kpis Array of KPIs to analyze
 * @returns An array of KPI trend objects
 */
export function analyzeKpiTrends(kpis: KPI[]): KPITrend[] {
  return kpis.map(analyzeKpiTrend);
}

/**
 * Calculate the trend direction and percentage change between two numbers
 * @param current Current value
 * @param previous Previous value
 * @returns An object with trend direction, percentage change and whether it's positive
 */
export function calculateTrend(current: number, previous: number): KPITrend {
  if (previous === 0) {
    return {
      currentValue: current,
      previousValue: previous,
      direction: current > 0 ? 'up' : 'neutral',
      percentageChange: current > 0 ? 100 : 0,
      percentage: current > 0 ? 100 : 0,
      isPositive: current > 0
    };
  }
  
  const percentageChange = calculatePercentageChange(current, previous);
  const direction = determineTrendDirection(percentageChange);
  
  return {
    currentValue: current,
    previousValue: previous,
    direction,
    percentageChange,
    percentage: Math.abs(percentageChange),
    isPositive: direction === 'up'
  };
}
