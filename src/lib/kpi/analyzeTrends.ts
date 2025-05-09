
import { KPI, KPITrend, TrendDirection } from '@/types/shared';

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Determine trend direction based on values
 */
function determineTrendDirection(current: number, previous: number): TrendDirection {
  if (current > previous) {
    return 'increasing';
  } else if (current < previous) {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Get whether a trend is positive based on the direction
 */
function isTrendPositive(direction: TrendDirection): boolean {
  return direction === 'increasing' || direction === 'up';
}

/**
 * Analyze KPI to determine trend
 */
export function analyzeKpiTrend(kpi: KPI): KPITrend {
  // If we have a previous value, calculate trend
  if (kpi.previous_value !== null && kpi.previous_value !== undefined) {
    const direction = determineTrendDirection(kpi.value, kpi.previous_value);
    const percentage = Math.abs(calculatePercentageChange(kpi.value, kpi.previous_value));
    const isPositive = isTrendPositive(direction);
    
    return {
      direction,
      percentage: Number(percentage.toFixed(1)),
      currentValue: kpi.value,
      previousValue: kpi.previous_value,
      isPositive,
      percentageChange: isPositive ? percentage : -percentage
    };
  }
  
  // If no previous value, assume stable
  return {
    direction: 'stable',
    percentage: 0,
    currentValue: kpi.value,
    previousValue: null,
    isPositive: false,
    percentageChange: 0
  };
}

/**
 * Analyze KPI against its target
 */
export function analyzeKpiTarget(kpi: KPI): KPITrend {
  // If we have a target, calculate trend against target
  if (kpi.target !== null && kpi.target !== undefined) {
    const percentageOfTarget = (kpi.value / kpi.target) * 100;
    let direction: TrendDirection;
    
    if (percentageOfTarget >= 100) {
      direction = 'increasing';
    } else if (percentageOfTarget >= 75) {
      direction = 'stable';
    } else {
      direction = 'decreasing';
    }
    
    return {
      direction,
      percentage: Number(percentageOfTarget.toFixed(1)),
      currentValue: kpi.value,
      previousValue: null,
      isPositive: isTrendPositive(direction),
      percentageChange: kpi.value - kpi.target
    };
  }
  
  // If no target, assume stable
  return {
    direction: 'stable',
    percentage: 0,
    currentValue: kpi.value,
    previousValue: null,
    isPositive: false,
    percentageChange: 0
  };
}
