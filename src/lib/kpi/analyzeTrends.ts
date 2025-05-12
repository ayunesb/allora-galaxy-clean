
import { KPITrend, TrendDirection } from '@/types/shared';

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
  const direction = calculateTrendDirection(current, previous);

  return {
    name,
    value: current,
    previousValue: previous || undefined,
    direction,
    unit,
    target
  };
}

export function createEmptyTrend(name: string, unit: string = ''): KPITrend {
  return {
    name,
    value: 0,
    previousValue: undefined,
    direction: 'neutral',
    unit
  };
}

export function analyzeKPITrend(kpi: KPI): KPITrend {
  let direction: TrendDirection = 'neutral';
  
  if (kpi.previous_value !== null && kpi.previous_value !== undefined) {
    if (kpi.value > kpi.previous_value) {
      direction = 'up';
    } else if (kpi.value < kpi.previous_value) {
      direction = 'down';
    } else {
      direction = 'neutral';
    }
  }
  
  return {
    name: kpi.name,
    value: kpi.value,
    previousValue: kpi.previous_value || undefined,
    direction,
    unit: kpi.unit,
    target: kpi.target || undefined
  };
}

export function createMockKPITrend(config: {
  name: string;
  value: number;
  previousValue?: number;
  direction?: TrendDirection;
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
  
  let direction = config.direction || 'neutral';
  if (!config.direction) {
    if (value > previousValue) {
      direction = 'up';
    } else if (value < previousValue) {
      direction = 'down';
    } else {
      direction = 'neutral';
    }
  }
  
  return {
    name,
    value,
    previousValue,
    direction,
    unit,
    target
  };
}
