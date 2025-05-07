
import { KPI } from '@/types/index';

/**
 * Calculate percentage change between current and previous KPI values
 */
export const getTrendDelta = (kpi: KPI): number | null => {
  if (!kpi || kpi.previous_value === undefined || kpi.previous_value === null || kpi.previous_value === 0) {
    return null;
  }
  
  return ((kpi.value - kpi.previous_value) / kpi.previous_value) * 100;
};

/**
 * Determine if a trend is positive, negative or neutral
 */
export const getTrendDirection = (kpi: KPI): 'positive' | 'negative' | 'neutral' => {
  const delta = getTrendDelta(kpi);
  
  if (delta === null) return 'neutral';
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
};

/**
 * Format trend percentage for display
 */
export const formatTrendPercentage = (kpi: KPI): string => {
  const delta = getTrendDelta(kpi);
  
  if (delta === null) return '—';
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
};
