
/**
 * Central type export system for Allora OS
 * This file re-exports all types from the type system in a structured way
 */

// Re-export by domain with namespaces to avoid conflicts
import * as NavigationTypes from './navigation';
import * as UserTypes from './user';
import * as TenantTypes from './tenant';
import * as StrategyTypes from './strategy';
import * as PluginTypes from './plugin';
import * as VotingTypes from './voting';
import * as LogTypes from './logs';
import * as KpiTypes from './kpi';
import * as TrendTypes from './trends';
import * as ExecutionTypes from './fixed/execution';
import * as EvolutionTypes from './evolution';
import * as OnboardingTypes from './onboarding';
import * as NotificationTypes from './notifications';
import * as GalaxyTypes from './galaxy';
import * as ApiKeyTypes from './api-key';

// Export domain namespaces
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
  GalaxyTypes,
  ApiKeyTypes
};

// Re-export commonly used shared types
export type { 
  DateRange,
  NavigationItem,
  UserRole,
  TrendDirection,
  SystemEventModule,
  SystemEventType,
  BaseEntity,
  KPITrend,
  ExecutionType,
  ExecutionParams,
  TenantFeature,
  VoteType
} from './shared';

// Re-export core entity types for direct usage
export type { User, UserProfile } from './user';
export type { SystemLog, AuditLog, LogFilters } from './logs';
export type { Strategy } from './strategy';
export type { Plugin, PluginLog, PluginResult } from './plugin';
export type { Tenant } from './tenant';
export type { KPI } from './kpi';
export type { 
  Notification,
  NotificationType,
  NotificationDisplay,
  NotificationFilter 
} from './notifications';
export type {
  OnboardingStep,
  OnboardingFormData,
  ValidationResult,
  PersonaProfile
} from './onboarding';
export type { 
  ExecutionRecord,
  ExecuteStrategyInput,
  ExecuteStrategyResult,
  StrategyExecutionOptions
} from './fixed/execution';
export type { ApiKey, ApiKeyResponse, ApiKeyCreateParams } from './api-key';
