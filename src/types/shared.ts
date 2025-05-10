
// Add DateRange type if it doesn't exist
export interface DateRange {
  from: Date;
  to?: Date | null;
}

// Also ensure AuditLog type is properly defined
export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  tenant_id: string;
  created_at: string;
  metadata?: any;
  user_id?: string;
}

// Define SystemEventModule type
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'tenant'
  | 'user'
  | 'execution'
  | 'onboarding'
  | 'kpi'
  | 'notification'
  | 'cron'
  | 'integration';

// Define SystemEventType
export type SystemEventType =
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'success'
  | 'failure'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'executed'
  | 'scheduled';

// Define OnboardingStep
export type OnboardingStep =
  | 'company-info'
  | 'persona'
  | 'additional-info'
  | 'strategy-generation';

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
  icon?: string | React.ComponentType<any>;
  items?: NavigationItem[];
  requiresAuth?: boolean;
  roles?: UserRole[];
  isActive?: boolean;
  children?: NavigationItem[];
  adminOnly?: boolean;
}

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
  name?: string;
  value?: number;
  previousValue?: number | null;
  trend?: TrendDirection;
  percentChange?: number;
  target?: number;
  unit?: string;
  isPositive?: boolean;
  currentValue?: number;
  direction?: TrendDirection; 
  percentage?: number;
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

// Add the KPI interface
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
  date: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
