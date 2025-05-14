
export interface KpiTrend {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  history?: number[];
  months?: string[];
}

export type TrendDirection = 'up' | 'down' | 'flat' | 'none';

export interface KpiInsight {
  kpiName: string;
  message: string;
  direction: TrendDirection;
  priority: 'low' | 'medium' | 'high';
  changePercentage?: number;
}
