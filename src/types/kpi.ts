
export interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number;
  date: string;
  category?: string;
  tenant_id?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export type TrendDirection = 'up' | 'down' | 'flat';

export interface KpiTrend {
  kpi_id: string;
  name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  direction: TrendDirection;
  dates: string[];
  values: number[];
}

export interface KpiCategory {
  name: string;
  kpis: KPI[];
}
