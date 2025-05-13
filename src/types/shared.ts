
/**
 * Shared type definitions for use across the application
 */

// User role types
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Navigation item type
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  requiresRole?: UserRole[];
  children?: NavigationItem[];
}

// KPI trend direction
export type TrendDirection = 'up' | 'down' | 'neutral';

// System event modules for logging
export type SystemEventModule = 'user' | 'auth' | 'strategy' | 'plugin' | 'agent' | 'system' | 'billing' | 'tenant';

// System event types for logging
export type SystemEventType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'execute'
  | 'generate'
  | 'vote'
  | 'approve'
  | 'reject'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

// Onboarding step type
export type OnboardingStep = 
  | 'welcome' 
  | 'company-info' 
  | 'persona' 
  | 'additional-info' 
  | 'strategy-generation' 
  | 'completed';

// Base entity interface for common properties
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Execution parameters interface
export interface ExecutionParams {
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  tenant_id: string;
  user_id?: string;
  input?: Record<string, any>;
}

// Execution type
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

// KPI trend interface
export interface KPITrend {
  name: string;
  value: number;
  previousValue: number | null;
  direction: TrendDirection;
  percentageChange: number | null;
}

// Tenant feature flags
export type TenantFeature = 
  | 'strategy_creation'
  | 'agent_voting'
  | 'plugin_management'
  | 'advanced_analytics'
  | 'white_label';

// Vote type for agent and plugin voting
export type VoteType = 'upvote' | 'downvote';

// Generic filter state interface
export interface FilterState {
  searchQuery?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Generic filter props interface
export interface FilterProps<T extends FilterState> {
  filters: T;
  onFilterChange: (filters: T) => void;
}

// Date range for filtering
export interface DateRange {
  from: Date;
  to?: Date;
}
