import { KPI } from '@/types';
import { KPITrend, TrendDirection } from '@/types/shared';

/**
 * Analyzes KPI trends by comparing current and previous values
 * @param kpi The KPI to analyze
 * @returns The trend analysis
 */
export function analyzeKpiTrend(kpi: KPI): KPITrend {
  // Default trend if there's no previous value
  if (kpi.previous_value === null || kpi.previous_value === undefined) {
    return {
      direction: 'flat' as TrendDirection,
      percentage: 0,
      isPositive: false
    };
  }

  // Handle division by zero
  if (kpi.previous_value === 0) {
    // If current value is also 0, it's flat
    if (kpi.value === 0) {
      return {
        direction: 'flat' as TrendDirection,
        percentage: 0,
        isPositive: false
      };
    }
    
    // Otherwise it's an increase
    return {
      direction: 'up' as TrendDirection,
      percentage: 100,
      isPositive: kpi.category !== 'cost' // For cost KPIs, going up is generally negative
    };
  }

  // Calculate percentage change
  const percentChange = ((kpi.value - kpi.previous_value) / Math.abs(kpi.previous_value)) * 100;
  
  // Determine direction
  let direction: TrendDirection = 'flat';
  if (percentChange > 1) {
    direction = 'up';
  } else if (percentChange < -1) {
    direction = 'down';
  }
  
  // Is this change positive?
  // For cost metrics, a decrease is positive
  // For most other metrics, an increase is positive
  const isPositive = kpi.category === 'cost' ? direction === 'down' : direction === 'up';
  
  return {
    direction,
    percentage: Math.abs(Math.round(percentChange)),
    isPositive
  };
}
