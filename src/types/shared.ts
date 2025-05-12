
// Common shared types used across the application

export type OnboardingStep = 'welcome' | 'company_info' | 'persona' | 'additional_info' | 'strategy_generation' | 'complete';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type SystemEventModule = 'user' | 'auth' | 'strategy' | 'plugin' | 'agent' | 'system' | 'billing' | 'tenant';

export type SystemEventType = 'create' | 'update' | 'delete' | 'execute' | 'error' | 'login' | 'logout';

export type TrendDirection = 'up' | 'down' | 'flat';

export type VoteType = 'upvote' | 'downvote' | 'neutral';

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

export type TenantFeature = 'ai_generation' | 'analytics' | 'evolution' | 'integrations' | 'export';

/**
 * Date range selection for filtering purposes
 */
export interface DateRange {
  from: Date;
  to?: Date;
}

/**
 * Base entity interface with common properties
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Filter state for data filtering components
 */
export interface FilterState {
  searchTerm?: string;
  dateRange?: DateRange;
  [key: string]: any;
}

/**
 * Common props for filtering components
 */
export interface FilterProps<T extends FilterState> {
  filters: T;
  onFilterChange: (filters: T) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Navigation item for menus and sidebars
 */
export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: UserRole[];
}

/**
 * KPI trend information
 */
export interface KPITrend {
  currentValue: number;
  previousValue: number;
  percentChange: number;
  direction: TrendDirection;
}

/**
 * Execution parameters for strategies and plugins
 */
export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}
