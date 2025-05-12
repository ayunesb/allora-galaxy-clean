
// Common shared types across the application

// Date range type for date pickers
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

// Vote types used in agent voting
export type VoteType = 'up' | 'down' | 'upvote' | 'downvote';

// Audit log and system log related types
export interface BaseLog {
  id: string;
  created_at: string;
  tenant_id?: string;
}

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'completed';

// Navigation related types
export interface NavigationItem {
  title: string;
  href: string;
  icon: React.FC;
  items?: NavigationItem[];
  adminOnly?: boolean;
  disabled?: boolean;
  external?: boolean;
}

// User related types
export type UserRole = 'admin' | 'user' | 'guest';

// Trend related types
export type TrendDirection = 'up' | 'down' | 'neutral';
export type KPITrend = 'increasing' | 'decreasing' | 'stable';

// System event related types
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'webhook' 
  | 'notification' 
  | 'system'
  | 'billing'
  | 'execution'
  | 'email'
  | 'onboarding';

export type SystemEventType = string;

// Onboarding related types
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

// Base entity and execution types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface ExecutionParams {
  [key: string]: any;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Tenant related types
export interface TenantFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

// KPI related types
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: KPITrend;
  change?: number;
  date?: string;
  source?: string;
  tenant_id?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}
