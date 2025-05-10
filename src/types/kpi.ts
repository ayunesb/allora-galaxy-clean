
// KPI related types
import { TrendDirection } from './trends';

export interface KPI {
  id: string;
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number;
  source?: 'stripe' | 'ga4' | 'hubspot' | 'manual';
  category?: 'financial' | 'marketing' | 'sales' | 'product';
  date: string;
  created_at: string;
  updated_at: string;
}

// KPI trend data
export interface KPITrend {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  percentChange: number;
  direction: TrendDirection;
  target?: number;
  date: string;
  category?: string;
}
