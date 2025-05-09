
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
  trend?: TrendDirection;
  trend_percentage?: number;
  metric_type: 'revenue' | 'users' | 'conversion' | 'engagement' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  created_at: string;
  updated_at: string;
}

// Missing type definitions that are imported across the project
export type VoteType = 'upvote' | 'downvote' | 'neutral';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
  adminOnly?: boolean;
}

export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'tenant'
  | 'user'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'notification'
  | 'kpi'
  | 'execution';

export type SystemEventType = 'info' | 'warning' | 'error' | 'success';

export type OnboardingStep = 'welcome' | 'company' | 'goals' | 'industry' | 'persona' | 'complete';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionParams {
  [key: string]: any;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
}

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

export interface TenantFeature {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  owner_id?: string;
  metadata?: Record<string, any>;
  features?: TenantFeature[];
}

export interface DateRange {
  from: Date;
  to?: Date;
}
