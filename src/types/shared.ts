
// Central shared type file
// This file now only contains re-exports of types from their specific domain files
// to maintain backward compatibility

// Re-export all domain-specific types
export type { NavigationItem } from './navigation';
export type { User, Profile, UserRole } from './user';
export type { Tenant, TenantFeature } from './tenant';
export type { 
  Strategy,
  StrategyFilter
} from './strategy';
export type { 
  Plugin, 
  AgentVersion,
  PluginLog,
  PluginResult,
  RunPluginChainResult
} from './plugin';
export type { 
  VoteType, 
  AgentVote 
} from './voting';
export type { 
  SystemLog, 
  AuditLog, 
  LogStatus, 
  SystemEventModule, 
  SystemEventType 
} from './logs';
export type { 
  KPI,
  KPITrend
} from './kpi';
export type { TrendDirection } from './trends';
export type { 
  Execution,
  ExecutionParams,
  ExecutionType,
  BaseEntity
} from './execution';
export type { EvolutionFilter } from './evolution';
export type { OnboardingStep } from './onboarding';

// Add DateRange type
export interface DateRange {
  from: Date;
  to?: Date;
}
