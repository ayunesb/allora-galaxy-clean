
// Central type exports file
// This file re-exports all types from the type system for easier imports

// Re-export types from their respective domains
export type * from './plugin';
export type * from './strategy';
export type * from './agent';
export type * from './execution';
export type * from './tenant';

// Export shared types
export type {
  UserRole,
  NavigationItem,
  VoteType,
  TrendDirection,
  SystemEventModule,
  SystemEventType,
  OnboardingStep,
  BaseEntity,
  ExecutionParams,
  ExecutionType,
  KPITrend,
  LogStatus,
  // Now includes TenantFeature
  Tenant
} from './shared';

export type { NotificationType } from './notifications';

// Re-export remaining types
export type * from './galaxy';
// Export onboarding types without conflicts
export type { OnboardingFormData, OnboardingState, OnboardingAction } from './onboarding';

// Fixed exports to avoid ambiguity
export type { 
  RunPluginChainResult 
} from './plugin';

// Define Strategy type to avoid import errors
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "draft";
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  tenant_id?: string;
  created_by?: string;
  approved_by?: string;
  completion_percentage?: number;
  due_date?: string;
  priority?: string;
}

// Add the KPI interface if it doesn't already exist
export interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  unit: string;
  target?: number | null;
  category: string;
  period: string;
  source?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  date: string;
}

// Define PluginLog interface needed for StrategyBuilder.tsx
export interface PluginLog {
  id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  tenant_id?: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  created_at?: string;
  execution_time?: number;
  xp_earned?: number;
}
