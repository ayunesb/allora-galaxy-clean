
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
  id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  unit: string;
  target?: number | null;
  category: string;
  period: string;
  source?: string;
  date: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
