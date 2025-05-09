
// Type definitions for shared resources across the application

// User roles
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Vote types
export type VoteType = 'upvote' | 'downvote' | 'neutral';

// Navigation item definition
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
  divider?: boolean;
  requiresRole?: UserRole[];
}

// System event module types
export type SystemEventModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'system' | string;

// System event types
export type SystemEventType = 'info' | 'warning' | 'error' | 'success' | 'strategy_executed' | 
                            'plugin_executed' | 'agent_evolved' | 'user_login' | 'user_logout' | string;

// Strategy statuses
export type StrategyStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'failed';

// Generic pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Generic filter parameters
export interface FilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any;
}

// KPI trend direction
export type TrendDirection = 'up' | 'down' | 'neutral' | 'flat';

// Log status
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

// Base entity interface
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Execution parameters
export interface ExecutionParams {
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  input?: any;
  options?: Record<string, any>;
}

// Execution type
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

// KPI trend
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  value: number;
}

// Tenant interface
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, any>;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
  features?: TenantFeature[];
}

// Tenant feature
export type TenantFeature = 'ai_strategies' | 'multi_agent' | 'analytics' | 'galaxy_view' | 'audit_logs';

// Onboarding steps
export type OnboardingStep = 'welcome' | 'company_info' | 'persona' | 'additional_info' | 'strategy_generation' | 'complete';
