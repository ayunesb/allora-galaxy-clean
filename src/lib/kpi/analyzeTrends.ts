
import { KPITrend, TrendDirection } from '@/types/shared';

/**
 * Analyze KPI trends from current and previous data points
 */
export function analyzeTrends(
  currentData: Array<{ 
    id: string; 
    name: string; 
    value: number; 
    previous_value?: number | null;
    category: string;
  }>
): KPITrend[] {
  return currentData.map(item => {
    // Calculate change and trend direction
    const previousValue = item.previous_value !== undefined ? item.previous_value : null;
    const change = previousValue !== null ? 
      ((item.value - previousValue) / Math.abs(previousValue || 1)) * 100 : 
      0;
    
    let trend: TrendDirection = 'neutral';
    if (previousValue !== null) {
      if (change > 0) trend = 'up';
      else if (change < 0) trend = 'down';
    }

    return {
      id: item.id,
      name: item.name,
      change: Math.abs(change),
      trend,
      currentValue: item.value,
      previousValue,
      unit: '%', // Default unit
      category: item.category
    };
  });
}
