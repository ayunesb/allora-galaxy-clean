
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

/**
 * Get trend direction for KPI data
 */
export function getTrendDirection(kpiData: { 
  value: number; 
  previous_value?: number | null;
}): 'positive' | 'negative' | 'neutral' {
  const previousValue = kpiData.previous_value !== undefined ? kpiData.previous_value : null;
  
  if (previousValue === null || previousValue === kpiData.value) {
    return 'neutral';
  }
  
  return kpiData.value > previousValue ? 'positive' : 'negative';
}

/**
 * Format trend percentage for display
 */
export function formatTrendPercentage(change: number): string {
  const absChange = Math.abs(change);
  return `${change >= 0 ? '+' : '-'}${absChange.toFixed(1)}%`;
}
