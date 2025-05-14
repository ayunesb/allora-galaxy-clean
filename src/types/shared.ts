
// Define shared types used across the application

// User and Auth related types
export type UserRole = 'admin' | 'owner' | 'member' | 'guest';

// Use enum for better TypeScript protection and consistency
export enum VoteType {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral'
}

export enum TrendDirection {
  Up = 'up',
  Down = 'down',
  Neutral = 'neutral'
}

export type FilterState = {
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  module?: string;
  severity?: string[];
};

export enum SystemEventModule {
  System = 'system',
  Auth = 'auth',
  Strategy = 'strategy',
  Plugin = 'plugin',
  Agent = 'agent',
  Tenant = 'tenant',
  Integration = 'integration'
}

export enum LogSeverity {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Debug = 'debug'
}

export type SystemLogFilter = {
  module?: SystemEventModule[];
  severity?: LogSeverity[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  search?: string;
};

export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  System = 'system'
}

// Calendar & DateRange related types
export interface DateRange {
  from: Date;
  to?: Date | undefined;
}

// Navigation types
export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
  isNew?: boolean;
  isExternal?: boolean;
}

// Add BaseEntity for consistent ID and timestamp fields across entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Standardize property names
export interface CommonProps {
  isLoading?: boolean; // Preferred over "loading"
  error?: Error | null;
  className?: string;
}

// Add consistent execution types
export enum ExecutionType {
  Strategy = 'strategy',
  Plugin = 'plugin',
  Agent = 'agent'
}

export type ExecutionParams = Record<string, any>;

// Add tenant feature flags
export enum TenantFeature {
  StrategyGeneration = 'strategy_generation',
  AgentVoting = 'agent_voting',
  PluginMarketplace = 'plugin_marketplace',
  Analytics = 'analytics',
  TeamManagement = 'team_management'
}

// Add SystemEventType for better event categorization
export enum SystemEventType {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
  Executed = 'executed',
  Failed = 'failed',
  Completed = 'completed'
}
