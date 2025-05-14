
export interface SystemLog {
  id: string;
  created_at: string;
  module: string;
  event: string;
  level: string;
  description: string;
  context: Record<string, any>;
  tenant_id: string;
}

// Add TrendDirection enum definition 
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  NEUTRAL = 'neutral'
}

// Add NavigationItem type
export interface NavigationItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  href: string;
  badge?: string | number;
  items?: NavigationItem[];
  permission?: string;
}

// Add or update SystemLogFilter type
export interface SystemLogFilter {
  searchTerm?: string;
  module?: SystemEventModule;
  level?: 'info' | 'warning' | 'error';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Add or ensure SystemEventModule type exists
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'tenant' 
  | 'api' 
  | 'user' 
  | 'system';

// Standardize VoteType across the application
export type VoteType = 'up' | 'down';

// Add AuditLogFilter type
export interface AuditLogFilter {
  searchTerm?: string;
  module?: SystemEventModule;
  startDate?: string;
  endDate?: string;
  type?: string;
}

// Add AuditLog interface
export interface AuditLog {
  id: string;
  module: string;
  event: string;
  action: string;
  description: string;
  created_at: string;
  user_id?: string;
  tenant_id?: string;
}

// Add UserRole type
export type UserRole = 'admin' | 'member' | 'owner' | 'guest';

// Add BaseEntity type
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Add ExecutionParams type
export interface ExecutionParams {
  [key: string]: any;
}

// Add ExecutionType type
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Add KPITrend type
export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
}

// Add TenantFeature type
export type TenantFeature = 
  | 'api_access' 
  | 'custom_plugins' 
  | 'advanced_analytics' 
  | 'team_collaboration';

// Add OnboardingStep type
export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'strategy' | 'complete';
