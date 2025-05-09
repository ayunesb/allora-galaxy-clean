
export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  user_id?: string;
  tenant_id: string;
  metadata?: any;
  created_at: string;
}

export interface KPI {
  id: string;
  tenant_id: string;
  name: string;
  value: number;
  target: number;
  previous_value?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  trend_percentage?: number;
  metric_type: 'revenue' | 'users' | 'conversion' | 'engagement' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  created_at: string;
  updated_at: string;
}
