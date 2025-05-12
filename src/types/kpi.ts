/**
 * KPI related types for the application
 */

// KPI trend direction type
export type KPITrend = 'increasing' | 'decreasing' | 'stable';

// Complete KPI trend object with detailed information
export interface KPITrendObject {
  name: string;
  value: number;
  previousValue?: number;
  trend: KPITrend;
  percentChange: number;
  unit: string;
  target?: number;
}

// KPI data structure
export interface KPI {
  value: number;
  unit: string;
  previous_value?: number;
}
