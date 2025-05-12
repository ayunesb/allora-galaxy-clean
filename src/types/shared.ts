
import { LucideIcon } from 'lucide-react';

// Date range type for filters
export interface DateRange {
  from: Date;
  to?: Date;
}

// Vote types used in agent voting system
export type VoteType = 'upvote' | 'downvote';

// Generic filter state type
export interface FilterState<T = string> {
  searchTerm?: string;
  module?: T;
  dateRange?: DateRange;
}

// Generic filter props type
export interface FilterProps<T = string> {
  onFilterChange: (filters: FilterState<T>) => void;
  filters: FilterState<T>;
  modules?: T[];
}

// Navigation item for sidebar and menus
export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon | string;
  items?: NavigationItem[];
  adminOnly?: boolean;
}

// User role definitions
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

// Trend direction for KPI data visualization
export type TrendDirection = 'up' | 'down' | 'neutral';

// System event module types for logging
export type SystemEventModule = 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'user' 
  | 'tenant' 
  | 'auth' 
  | 'billing' 
  | 'hubspot'
  | 'system';

// System event types for categorizing log entries
export type SystemEventType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'audit';

// Onboarding step interface
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  order: number;
  component?: React.ComponentType<any>;
}

// Base entity interface for common entity fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// KPI trend interface
export interface KPITrend {
  id?: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  direction?: TrendDirection;
  unit?: string;
  target?: number;
}

// Execution types for plugins and strategies
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Execution parameters interface
export interface ExecutionParams {
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Tenant feature interface for feature flags
export interface TenantFeature {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}
