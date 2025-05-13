
// Shared types for the application

// Vote types
export type VoteType = 'upvote' | 'downvote';

// System event types
export type SystemEventModule = 
  'system' | 
  'user' | 
  'auth' | 
  'tenant' | 
  'billing' | 
  'strategy' | 
  'plugin' | 
  'agent' | 
  'webhook' |
  string; // Allow string for future modules

export type SystemEventType = 
  'info' | 
  'error' | 
  'warning' | 
  'create' | 
  'update' | 
  'delete' | 
  'login' | 
  'logout' |
  string; // Allow string for future event types

// Type for date range picker
export interface DateRange {
  from: Date;
  to?: Date;
}

// Navigation and UI types
export type NavigationItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  disabled?: boolean;
};

// User roles
export type UserRole = 'admin' | 'member' | 'viewer' | 'owner';

// KPI and Trend types
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPITrend {
  date: string;
  value: number;
}

// Execution types
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';
export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  options?: Record<string, any>;
}

// Entity types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Tenant types
export type TenantFeature = 'ai_decisions' | 'galaxy_view' | 'advanced_analytics' | 'webhook_integrations';

// Onboarding
export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'strategy' | 'complete';
