
import { ReactNode } from 'react';

// Navigation types
export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  items?: NavigationItem[];
}

// User roles
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

// Date range type used for filtering
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

// Trend direction for KPIs
export type TrendDirection = 'up' | 'down' | 'neutral';

// System event types
export type SystemEventModule = 'auth' | 'strategy' | 'plugin' | 'agent' | 'tenant' | 'user' | 'system';
export type SystemEventType = 'create' | 'update' | 'delete' | 'execute' | 'login' | 'logout' | 'error';

// Unified VoteType definition
export type VoteType = 'up' | 'down' | 'upvote' | 'downvote';

// Execution types
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';
export interface ExecutionParams {
  strategyId?: string;
  pluginId?: string;
  agentId?: string;
  [key: string]: any;
}

// Onboarding
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

// Base type for most entities
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// KPI trend information
export interface KPITrend {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  direction: TrendDirection;
}

// Tenant feature flags
export type TenantFeature = 'analytics' | 'ai-agents' | 'evolution' | 'brain' | 'billing';

// Filter types for components
export interface FilterState {
  [key: string]: any;
}

export interface FilterProps {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  onApply?: () => void;
  onReset?: () => void;
}
