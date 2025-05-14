
import { ReactNode } from 'react';

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

export interface NavigationConfig {
  mainNavItems: NavigationItem[];
  adminNavItems: NavigationItem[];
}

// Shared enums
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

export enum FilterState {
  All = 'all',
  Active = 'active',
  Complete = 'complete',
  Pending = 'pending'
}

export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  System = 'system'
}

// Date utilities
export type DateRange = {
  from: Date;
  to?: Date;
};

// Common onboarding steps
export type OnboardingStep = 
  | 'welcome'
  | 'company'
  | 'persona'
  | 'team'
  | 'goals'
  | 'complete';

// System event types
export enum SystemEventModule {
  Authentication = 'authentication',
  Strategy = 'strategy',
  Agent = 'agent',
  Plugin = 'plugin',
  Tenant = 'tenant',
  Admin = 'admin',
  User = 'user',
  System = 'system'
}

export enum LogSeverity {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical'
}
