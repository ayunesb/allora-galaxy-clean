// If this file doesn't exist, we'll create it with the necessary types
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type SystemEventModule = 'auth' | 'strategy' | 'plugin' | 'system' | 'tenant' | 'execution' | string;
export type SystemEventType = 'create' | 'update' | 'delete' | 'error' | 'login' | 'logout' | 'execute' | string;

export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description?: string;
  tenant_id: string;
  user_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Add VoteType enum that was missing
export type VoteType = 'upvote' | 'downvote' | 'neutral';

// Add NavigationItem interface that was missing
export interface NavigationItem {
  id?: string;
  name: string;
  label?: string;
  href: string;
  icon?: React.ElementType;
  children?: NavigationItem[];
  adminOnly?: boolean;
}

// Add TrendDirection type that was missing
export type TrendDirection = 'up' | 'down' | 'increasing' | 'decreasing' | 'stable' | 'neutral';

// Add OnboardingStep type that was missing
export type OnboardingStep = 
  'welcome' | 
  'company-info' | 
  'persona' | 
  'strategy-generation' | 
  'additional-info' | 
  'complete';

// Add BaseEntity interface that was missing
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Add ExecutionParams interface that was missing
export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Add ExecutionType type that was missing
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Add KPITrend interface that was missing
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  currentValue: number;
  previousValue: number | null;
  isPositive: boolean;
  percentageChange: number;
}

// Add LogStatus type that was missing
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

// Add TenantFeature type that was missing
export type TenantFeature = 
  'ai_strategy_generation' | 
  'plugin_ecosystem' | 
  'agent_evolution' | 
  'kpi_tracking' | 
  'multi_user';

// Add Tenant interface that was missing
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: {
    features?: TenantFeature[];
    [key: string]: any;
  };
}

// Add this DateRange type if it doesn't exist
export interface DateRange {
  from: Date;
  to?: Date;
}

// Add KPI interface that was missing
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
  created_at: string;
  updated_at: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  date: string;
}
