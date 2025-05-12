import { ReactNode } from 'react';

export interface DateRange {
  from: Date;
  to: Date;
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
  icon: React.FC;
  items?: NavigationItem[];
  adminOnly?: boolean;
  disabled?: boolean;
  external?: boolean;
}

// User related types
export type UserRole = 'admin' | 'user' | 'guest';

// Voting related types
export type VoteType = 'up' | 'down';

// Trend related types
export type TrendDirection = 'up' | 'down' | 'neutral';
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
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface SystemLog {
  id: string;
  message: string;
  timestamp: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
}
