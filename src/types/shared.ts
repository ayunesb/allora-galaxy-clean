
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type SystemEventModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'system' | 'security' | 'kpi' | 'onboarding' | 'billing' | 'marketing';

export type SystemEventType = 'info' | 'warning' | 'error' | 'success' | 'kpi_updated' | 'kpi_update_failed' | 'onboarding_completed';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresRole?: UserRole[];
  isActive?: (pathname: string) => boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
}

export type VoteType = 'upvote' | 'downvote' | 'neutral';

export type TrendDirection = 'up' | 'down' | 'flat';

export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'additional' | 'strategy';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent';

export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  strategy_id?: string;
}

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  timeframe: string;
}

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';
