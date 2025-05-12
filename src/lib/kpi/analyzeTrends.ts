
import { KPITrend, TrendDirection } from '@/types/shared';
import { KPI } from '@/types/kpi';

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
    value: current,
    previousValue: previous || undefined,
    direction,
    name,
    unit,
    target
  };
}

export function createEmptyTrend(name: string, unit: string = ''): KPITrend {
  return {
    value: 0,
    previousValue: undefined,
    direction: 'neutral',
    name,
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
    value: kpi.value,
    previousValue: kpi.previous_value || undefined,
    direction,
    name: kpi.name,
    unit: kpi.unit || '',
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
    value,
    previousValue,
    direction,
    name,
    unit,
    target
  };
}
