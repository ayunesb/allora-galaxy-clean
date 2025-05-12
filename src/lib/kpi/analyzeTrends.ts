
import { KPITrend, TrendDirection } from '@/types/shared';
import { calculatePercentChange } from '@/lib/utils';

// Define the KPI interface locally if not exported from shared types
interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  unit: string;
  target?: number | null;
  category: string;
  source?: string;
  date: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export function calculateTrendDirection(current: number, previous: number | null | undefined): TrendDirection {
  if (previous === null || previous === undefined) {
    return 'neutral';
  }
  
  if (current > previous) {
    return 'up';
  } else if (current < previous) {
    return 'down';
  }
  
  return 'neutral';
}

export function isPositiveTrend(direction: TrendDirection): boolean {
  return direction === 'up';
}

export function formatKPIValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  } else if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  
  return value.toLocaleString();
}

export function createKPITrend(name: string, current: number, previous: number | null | undefined, unit: string, target?: number): KPITrend {
  const trend = calculateTrendDirection(current, previous);
  const trendString = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';

  return {
    name,
    value: current,
    previousValue: previous || undefined,
    trend: trendString,
    unit,
    target
  };
}

export function createEmptyTrend(name: string, unit: string = ''): KPITrend {
  return {
    name,
    value: 0,
    previousValue: undefined,
    trend: 'stable',
    unit
  };
}

export function analyzeKPITrend(kpi: KPI): KPITrend {
  let trend: TrendDirection = 'neutral';
  
  if (kpi.previous_value !== null && kpi.previous_value !== undefined) {
    if (kpi.value > kpi.previous_value) {
      trend = 'up';
    } else if (kpi.value < kpi.previous_value) {
      trend = 'down';
    } else {
      trend = 'neutral';
    }
  }
  
  const trendString = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';
  
  return {
    name: kpi.name,
    value: kpi.value,
    previousValue: kpi.previous_value || undefined,
    trend: trendString,
    unit: kpi.unit,
    target: kpi.target || undefined
  };
}

export function createMockKPITrend(config: {
  name: string;
  value: number;
  previousValue?: number;
  trend?: TrendDirection;
  unit?: string;
  target?: number;
}): KPITrend {
  const {
    name,
    value,
    previousValue = value * 0.9,
    unit = '',
    target
  } = config;
  
  let trend = config.trend || 'neutral';
  if (!config.trend) {
    if (value > previousValue) {
      trend = 'up';
    } else if (value < previousValue) {
      trend = 'down';
    } else {
      trend = 'neutral';
    }
  }
  
  const trendString = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';
  
  return {
    name,
    value,
    previousValue,
    trend: trendString,
    unit,
    target
  };
}
