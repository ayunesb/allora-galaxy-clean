
// Central type exports file
// This file re-exports all types from the type system for easier imports

// Re-export types from their respective domains with namespace prefixes to avoid conflicts
import * as NavigationTypes from './navigation';
import * as UserTypes from './user';
import * as TenantTypes from './tenant';
import * as StrategyTypes from './strategy';
import * as PluginTypes from './plugin';
import * as VotingTypes from './voting';
import * as LogTypes from './logs';
import * as KpiTypes from './kpi';
import * as TrendTypes from './trends';
import * as ExecutionTypes from './execution';
import * as EvolutionTypes from './evolution';
import * as OnboardingTypes from './onboarding';
import * as NotificationTypes from './notifications';
import * as GalaxyTypes from './galaxy';

// Export the namespaces to allow importing like: import { UserTypes } from '@/types'
export { 
  NavigationTypes, 
  UserTypes, 
  TenantTypes, 
  StrategyTypes,
  PluginTypes,
  VotingTypes,
  LogTypes,
  KpiTypes,
  TrendTypes,
  ExecutionTypes,
  EvolutionTypes,
  OnboardingTypes,
  NotificationTypes,
  GalaxyTypes
};

// Also selectively re-export common types for backward compatibility
// This prevents duplicate export errors while maintaining compatibility
export type { 
  DateRange,
  FilterState,
  FilterProps,
  NavigationItem,
  UserRole,
  TrendDirection,
  SystemEventModule,
  SystemEventType,
  OnboardingStep,
  BaseEntity,
  KPITrend,
  ExecutionType,
  ExecutionParams,
  TenantFeature,
  VoteType
} from './shared';

// Export specific types that don't conflict
export type { User, UserProfile } from './user';
export type { SystemLog, AuditLog } from './logs';
export type { Strategy } from './strategy';
export type { Plugin } from './plugin';
export type { Tenant } from './tenant';
export type { KPI } from './kpi';
export type { Notification } from './notifications';
