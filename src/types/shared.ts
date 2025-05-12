
import { ReactNode } from 'react';

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

export interface MenuItem {
  title: string;
  href: string;
  icon?: ReactNode;
  disabled?: boolean;
  external?: boolean;
}

// Navigation related types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<any> | string;
  items?: NavigationItem[];
  adminOnly?: boolean;
  disabled?: boolean;
  external?: boolean;
}

// User related types
export type UserRole = 'admin' | 'member' | 'owner' | 'guest' | 'viewer';

// Voting related types
export type VoteType = 'upvote' | 'downvote';

// Trend related types
export type TrendDirection = 'up' | 'down' | 'neutral' | 'increasing' | 'decreasing' | 'stable';
export type KPITrend = 'increasing' | 'decreasing' | 'stable';

// System event related types
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'webhook' 
  | 'notification' 
  | 'system'
  | 'billing'
  | 'execution'
  | 'email'
  | 'onboarding';

export type SystemEventType = string;

// Onboarding related types
export type OnboardingStep = 'company-info' | 'persona' | 'additional-info' | 'strategy-generation';

// Base entity and execution types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface ExecutionParams {
  [key: string]: any;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// Tenant related types
export interface TenantFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

// KPI related types
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: KPITrend;
  change?: number;
  date?: string;
  source?: string;
  tenant_id?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}
