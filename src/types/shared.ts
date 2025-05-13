
export interface DateRange {
  from: Date;
  to?: Date;
}

export type VoteType = 'upvote' | 'downvote';

export type UserRole = 'admin' | 'user' | 'viewer' | 'owner';

export type TrendDirection = 'up' | 'down' | 'flat' | 'neutral';

export type SystemEventModule = 
  | 'auth'
  | 'tenant'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'execution'
  | 'onboarding'
  | 'system'
  | 'kpi'
  | 'user'
  | 'notification';

export type SystemEventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'executed'
  | 'failed';

export type KPITrend = {
  direction: TrendDirection;
  percentage: number;
  value: number; // Added missing value property
  previousValue?: number; // Added for consistency
};

export type OnboardingStep = 
  | 'welcome'
  | 'company'
  | 'goals'
  | 'industry'
  | 'tone'
  | 'complete';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent';

export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export type TenantFeature = 
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'analytics'
  | 'kpi'
  | 'notification';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}
