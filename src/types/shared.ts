
import { LucideIcon } from 'lucide-react';

// Base entity and shared types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// User related types
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}

// Navigation types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
  adminOnly?: boolean;
}

export interface NavigationConfig {
  mainNavItems: NavigationItem[];
  adminNavItems: NavigationItem[];
}

// System and notifications
export type VoteType = 'upvote' | 'downvote';

export enum SystemEventModule {
  STRATEGY = 'strategy',
  AGENT = 'agent',
  PLUGIN = 'plugin',
  TENANT = 'tenant',
  USER = 'user',
  SYSTEM = 'system',
  AUTH = 'auth',
  ONBOARDING = 'onboarding',
  KPI = 'kpi',
  NOTIFICATION = 'notification'
}

export type LogSeverity = 'info' | 'warning' | 'error' | 'debug' | 'verbose';

// KPI and analytics
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  NEUTRAL = 'neutral'
}

export interface KPITrend {
  trend: number;
  direction: TrendDirection;
  percentageChange?: number;
}

// Onboarding
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

// Feature flags
export enum TenantFeature {
  AI_GENERATED_CONTENT = 'aiGeneratedContent',
  ADVANCED_ANALYTICS = 'advancedAnalytics',
  CUSTOM_PLUGINS = 'customPlugins',
  MULTI_WORKSPACE = 'multiWorkspace',
  API_ACCESS = 'apiAccess'
}

// Execution
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

export interface ExecutionParams {
  tenant_id?: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_id?: string;
  params?: Record<string, any>;
}

// Date Range for filters
export interface DateRange {
  from: Date;
  to?: Date;
}

// System Log filter
export interface SystemLogFilter {
  module: string;
  event: string;
  searchTerm: string;
  dateRange?: DateRange;
}

// Audit Log filter
export interface AuditLogFilter {
  module: string;
  event: string;
  searchTerm: string;
  dateRange?: DateRange;
}

// Generic filter state and props
export interface FilterState<T> {
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
}

export interface FilterProps<T> {
  filters: T;
  onFilterChange: (filters: T) => void;
}

// Helper function to convert DateRange for API
export function convertDateRange(range?: DateRange): { start_date?: string; end_date?: string } {
  if (!range) return {};
  
  const result: { start_date?: string; end_date?: string } = {};
  
  if (range.from) {
    result.start_date = range.from.toISOString();
  }
  
  if (range.to) {
    result.end_date = range.to.toISOString();
  }
  
  return result;
}
