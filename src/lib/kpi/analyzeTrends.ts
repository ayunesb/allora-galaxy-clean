
import { KPITrendObject, KPI, KPITrend } from '@/types/kpi';
import { TrendDirection } from '@/types/trends';
import { calculatePercentChange } from '@/lib/utils';

/**
 * Calculate the trend direction based on current and previous values
 */
export function calculateTrendDirection(current: number, previous: number | null | undefined): KPITrend {
  if (previous === null || previous === undefined) {
    return 'stable';
  }
  
  if (current > previous) {
    return 'increasing';
  } else if (current < previous) {
    return 'decreasing';
  }
  
  return 'stable';
}

/**
 * Convert TrendDirection to KPITrend
 */
export function toKPITrend(direction: TrendDirection): KPITrend {
  if (direction === 'up' || direction === 'increasing') {
    return 'increasing';
  } else if (direction === 'down' || direction === 'decreasing') {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Check if the trend direction is positive
 */
export function isPositiveTrend(direction: TrendDirection | KPITrend): boolean {
  return direction === 'up' || direction === 'increasing';
}

/**
 * Format a KPI value with appropriate unit
 */
export function formatKPIValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  } else if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  
  return value.toLocaleString();
}

/**
 * Create a KPI trend object from raw values
 */
export function createKPITrend(name: string, current: number, previous: number | null | undefined, unit: string, target?: number): KPITrendObject {
  const trend = calculateTrendDirection(current, previous);
  const percentChange = previous !== null && previous !== undefined ? calculatePercentChange(current, previous) : 0;

  return {
    name,
    value: current,
    previousValue: previous || undefined,
    trend,
    percentChange,
    unit,
    target
  };
}

/**
 * Create an empty trend object with default values
 */
export function createEmptyTrend(name: string, unit: string = ''): KPITrendObject {
  return {
    name,
    value: 0,
    previousValue: undefined,
    trend: 'stable',
    percentChange: 0,
    unit
  };
}

/**
 * Analyze a KPI object and convert it to a KPITrendObject
 */
export function analyzeKPITrend(kpi: KPI): KPITrendObject {
  const trend = calculateTrendDirection(kpi.value, kpi.previous_value);
  const percentChange = kpi.previous_value !== null && kpi.previous_value !== undefined 
    ? calculatePercentChange(kpi.value, kpi.previous_value) 
    : 0;
  
  return {
    name: kpi.name,
    value: kpi.value,
    previousValue: kpi.previous_value || undefined,
    trend,
    percentChange,
    unit: kpi.unit,
    target: kpi.target || undefined
  };
}

/**
 * Create a mock KPI trend for testing/preview
 */
export function createMockKPITrend(config: {
  name: string;
  value: number;
  previousValue?: number;
  trend?: TrendDirection;
  unit?: string;
  target?: number;
}): KPITrendObject {
  const {
    name,
    value,
    previousValue = value * 0.9,
    unit = '',
    target
  } = config;
  
  let trend: KPITrend;
  if (config.trend) {
    trend = toKPITrend(config.trend);
  } else {
    trend = calculateTrendDirection(value, previousValue);
  }
  
  const percentChange = previousValue ? calculatePercentChange(value, previousValue) : 0;
  
  return {
    name,
    value,
    previousValue,
    trend,
    percentChange,
    unit,
    target
  };
}
