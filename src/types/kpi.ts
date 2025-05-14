
import { TrendDirection } from './shared';

// KPI related types
export interface KPI {
  id: string;
  name: string;
  category?: string;
  value: number;
  previous_value?: number;
  unit?: string;
  target?: number;
  date: string;
  tenant_id?: string;
  source?: string;
  updated_at: string;
  created_at: string;
}

// Aligning with shared KPITrend interface
export interface KPITrend {
  id?: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  direction: TrendDirection;
  trend?: 'increasing' | 'decreasing' | 'stable';
  unit?: string;
  target?: number;
}
