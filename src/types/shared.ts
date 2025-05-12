
/**
 * Shared types used across the application
 */

export type SystemRole = 'user' | 'admin' | 'owner';
export type WorkspaceRole = 'member' | 'admin' | 'owner';
export type UserRole = 'user' | 'admin' | 'owner';

/**
 * System event modules
 */
export type SystemEventModule = 'user' | 'auth' | 'strategy' | 'plugin' | 'agent' | 'system' | 'billing' | 'tenant';

/**
 * System event types
 */
export type SystemEventType = 
  'login' | 'logout' | 'registration' | 'password_reset' | 
  'error' | 'info' | 'warning' | 'success' | 
  'create' | 'update' | 'delete' | 'execute' |
  'verification' | 'invite' | 'join' | 'leave' |
  'payment' | 'subscription' | 'invoice' |
  'strategy_created' | 'strategy_updated' | 'strategy_deleted' | 'strategy_executed' | 'strategy_execution_failed' |
  'plugin_created' | 'plugin_updated' | 'plugin_deleted' | 'plugin_executed' |
  'agent_created' | 'agent_updated' | 'agent_deleted' | 'agent_vote' | 'agent_evolved';

/**
 * Date range type
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Chart time range
 */
export type TimeRange = '7d' | '30d' | '90d' | '12m' | 'all';

/**
 * Trend direction for KPIs
 */
export type TrendDirection = 'up' | 'down' | 'flat' | 'neutral';

/**
 * System message type for notifications and alerts
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info';

/**
 * Workspace user status
 */
export type UserStatus = 'active' | 'pending' | 'inactive' | 'blocked';

/**
 * Vote type for agent/plugin voting system
 */
export type VoteType = 'upvote' | 'downvote';

/**
 * Filter state for UI components
 */
export interface FilterState {
  [key: string]: any;
}

/**
 * Filter props for filter components
 */
export interface FilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * Navigation item for menus
 */
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  children?: NavigationItem[];
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
}

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * KPI Trend type
 */
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  value: number;
}

/**
 * Execution parameter interface
 */
export interface ExecutionParams {
  [key: string]: any;
}

/**
 * Execution type
 */
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

/**
 * Onboarding step type
 */
export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'additional' | 'strategy';

/**
 * Tenant feature flags
 */
export interface TenantFeature {
  name: string;
  enabled: boolean;
  limits?: Record<string, number>;
  metadata?: Record<string, any>;
}
