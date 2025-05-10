
// Add or update the AuditLog type in the shared types
export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  tenant_id: string;
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// Add missing VoteType type
export type VoteType = 'upvote' | 'downvote';

// Add missing TrendDirection type
export type TrendDirection = 'up' | 'down' | 'neutral';

// Add missing LogStatus type
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

// Add missing NavigationItem type
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  items?: NavigationItem[];
  requiresAuth?: boolean;
  roles?: UserRole[];
  isActive?: boolean;
}

// Add missing SystemEventModule type
export type SystemEventModule = 'auth' | 'strategy' | 'plugin' | 'agent' | 'kpi' | 'system';

// Add missing SystemEventType type
export type SystemEventType = 'create' | 'update' | 'delete' | 'error' | 'login' | 'logout';

// Add missing OnboardingStep type
export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'strategy' | 'complete';

// Add missing BaseEntity type
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Add missing ExecutionParams type
export interface ExecutionParams {
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  tenantId: string;
  userId?: string;
  input?: any;
}

// Add missing ExecutionType type
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Add missing KPITrend type
export interface KPITrend {
  name: string;
  value: number;
  previousValue?: number | null;
  trend: TrendDirection;
  percentChange?: number;
  target?: number;
  unit: string;
}

// Add missing UserRole type
export type UserRole = 'owner' | 'admin' | 'member' | 'guest' | 'api';

// Add missing TenantFeature type
export interface TenantFeature {
  id: string;
  name: string;
  enabled: boolean;
  tenant_id: string;
}

// Add missing Tenant interface
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: {
    logo_url?: string;
    primary_color?: string;
    features?: Record<string, boolean>;
    stripe_customer_id?: string;
    [key: string]: any;
  };
}

// Add missing DateRange interface
export interface DateRange {
  from: Date;
  to: Date;
}
