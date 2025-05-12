
import { KPI } from '@/types';
import { TrendDirection, KPITrend } from '@/types/shared';

/**
 * Analyzes KPI data to determine trend direction and percentage change
 * @param current Current KPI value
 * @param previous Previous KPI value
 * @returns Trend analysis object
 */
export function analyzeTrend(current: number, previous: number): KPITrend {
  // If no previous value, default to neutral
  if (previous === 0 || previous === undefined || previous === null) {
    return {
      direction: 'neutral',
      percentage: 0,
      value: 0
    };
  }

  const difference = current - previous;
  const percentageChange = (difference / Math.abs(previous)) * 100;
  
  let direction: TrendDirection = 'flat';
  
  // Determine trend direction
  if (percentageChange > 1) {
    direction = 'up';
  } else if (percentageChange < -1) {
    direction = 'down';
  } else {
    direction = 'flat';
  }
  
  return {
    direction,
    percentage: Math.abs(Math.round(percentageChange)),
    value: difference
  };
}

/**
 * Calculate trends for a list of KPIs
 * @param kpis Array of KPI objects
 * @returns Map of KPI IDs to trend data
 */
export function calculateKPITrends(kpis: KPI[]): Map<string, KPITrend> {
  const trends = new Map<string, KPITrend>();
  
  kpis.forEach(kpi => {
    trends.set(kpi.id, analyzeTrend(kpi.value, kpi.previous_value || 0));
  });
  
  return trends;
}

/**
 * Calculate the overall trend direction based on multiple KPIs
 * @param kpis Array of KPI objects
 * @returns Overall trend direction
 */
export function calculateOverallTrend(kpis: KPI[]): TrendDirection {
  if (kpis.length === 0) return 'neutral';
  
  const trends = calculateKPITrends(kpis);
  let upCount = 0;
  let downCount = 0;
  
  trends.forEach(trend => {
    if (trend.direction === 'up') upCount++;
    else if (trend.direction === 'down') downCount++;
  });
  
  if (upCount > downCount) return 'up';
  if (downCount > upCount) return 'down';
  return 'flat';
}

export default {
  analyzeTrend,
  calculateKPITrends,
  calculateOverallTrend
};
