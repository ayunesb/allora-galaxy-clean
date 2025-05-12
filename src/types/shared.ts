
import { DateRange as DayPickerDateRange } from 'react-day-picker';

export interface FilterState {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  category?: string;
  dateRange?: DateRange;
  [key: string]: any;
}

export interface FilterProps<T = FilterState> {
  filters: T;
  onFilterChange: (filters: T) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export interface DateRange {
  from: Date;
  to?: Date;
}

// Convert from react-day-picker DateRange to our DateRange
export function convertDateRange(dayPickerRange?: DayPickerDateRange): DateRange | undefined {
  if (!dayPickerRange || !dayPickerRange.from) return undefined;
  return {
    from: dayPickerRange.from,
    to: dayPickerRange.to
  };
}

// User role types
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

// Navigation item structure
export interface NavigationItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<any> | string;
  disabled?: boolean;
  external?: boolean;
  children?: NavigationItem[];
  items?: NavigationItem[]; // Support for items
  adminOnly?: boolean; // Support for adminOnly flag
}

// Trend direction types
export type TrendDirection = 'up' | 'down' | 'neutral';

// Voting types
export type VoteType = 'upvote' | 'downvote';

// System event types - unified with types/logs.ts
export type SystemEventModule = 
  | 'strategy'
  | 'agent'
  | 'plugin'
  | 'user'
  | 'tenant'
  | 'auth'
  | 'billing'
  | 'hubspot' 
  | 'system'
  | 'ai'
  | 'onboarding'; // Added onboarding module type

export type SystemEventType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'executed' 
  | 'approved' 
  | 'rejected'
  | 'error'
  | 'info'
  | 'warning';

// KPI trend types
export interface KPITrend {
  value: number;
  previousValue?: number;
  change?: number;
  direction: TrendDirection;
  name?: string; // Name property
  unit?: string; // Unit property
  target?: number; // Target property
}

// Base entity interface for common fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Execution parameters interface
export interface ExecutionParams {
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Execution type
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

// Tenant features
export type TenantFeature = 'ai_assistant' | 'analytics' | 'custom_plugins' | 'auto_optimization';

// Onboarding steps
export type OnboardingStep = 
  | 'welcome' 
  | 'company_info' 
  | 'persona' 
  | 'additional_info' 
  | 'strategy_generation' 
  | 'complete';

// System log filter type
export interface SystemLogFilter extends FilterState {
  module?: SystemEventModule;
  dateRange?: DateRange;
}
