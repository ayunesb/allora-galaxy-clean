
// Shared type definitions used across the application

// System Event Types
export type SystemEventType = 
  'error' | 
  'warn' | 
  'info' | 
  'debug' |
  'logs_cleanup' | 
  'logs_cleanup_failed' | 
  'scheduled_jobs_registered' |
  'strategy' |
  'onboarding_completed';

// Common Status Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination Params
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Sort Direction
export type SortDirection = 'asc' | 'desc';

// Sort Params
export interface SortParams {
  field: string;
  direction: SortDirection;
}

// User Role Type
export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Vote Type
export type VoteType = 'up' | 'down' | 'neutral' | 'upvote' | 'downvote';

// Navigation Item
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ElementType;
  requiresRole?: string[];
  title?: string;
  children?: NavigationItem[];
}

// Trend Direction for KPIs
export type TrendDirection = 'up' | 'down' | 'neutral';

// KPI Trend
export interface KPITrend {
  currentValue: number;
  previousValue: number;
  direction: TrendDirection;
  percentageChange: number;
  percentage?: number; // Adding to fix error in analyzeTrends.ts
  isPositive?: boolean; // Adding to fix error in analyzeTrends.ts
}

// System Event Module
export type SystemEventModule = 
  'auth' | 
  'strategy' | 
  'agent' | 
  'plugin' | 
  'tenant' | 
  'user' | 
  'system' |
  'logs_cleanup' |
  'logs_cleanup_failed' |
  'scheduled_jobs_registered' |
  'strategy' |
  'onboarding_completed';

// Base Entity
export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at?: string;
}

// Execution Types
export type ExecutionType = 'strategy' | 'plugin' | 'agent';

// Execution Parameters
export interface ExecutionParams {
  [key: string]: any;
}

// Tenant Features
export type TenantFeature = 
  'analytics' | 
  'ai_agents' | 
  'custom_plugins' | 
  'multi_user' | 
  'advanced_security';

// Onboarding Steps
export type OnboardingStep = 
  'welcome' | 
  'company-info' | 
  'persona' | 
  'additional-info' | 
  'strategy-generation' |
  'complete';

// Audit Log Entry
export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  module: string;
  event_type: string;
  user_id: string | null;
  metadata: any;
  created_at: string;
  tenant_id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
