
// User roles in the application
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Navigation item for sidebar and menus
export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

// Vote types for agent evaluations
export type VoteType = 'upvote' | 'downvote' | 'neutral';

// Trend direction for KPIs
export type TrendDirection = 'up' | 'down' | 'neutral';

// System event modules
export type SystemEventModule = 
  | 'auth' 
  | 'billing' 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'system' 
  | 'marketing'
  | 'product'
  | 'admin'
  | 'onboarding'
  | 'notification'
  | 'security';

// System event types
export type SystemEventType = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'kpi_updated'
  | 'kpi_update_failed'
  | 'user_created'
  | 'user_deleted'
  | 'tenant_created'
  | 'execute_strategy_started'
  | 'execute_strategy_completed'
  | 'execute_strategy_error'
  | 'audit'
  | 'onboarding_completed';

// Onboarding steps
export type OnboardingStep = 
  | 'company-info' 
  | 'persona' 
  | 'additional-info' 
  | 'strategy-generation';

// Base entity for database models
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Parameters for execution contexts
export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  dryRun?: boolean;
}

// Type of execution
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

// KPI trend data structure
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  raw_change: number;
}

// Log status options
export type LogStatus = 'pending' | 'running' | 'success' | 'error' | 'warning';

// Available tenant features
export type TenantFeature = 'ai_strategy' | 'analytics' | 'team_management' | 'integrations';
