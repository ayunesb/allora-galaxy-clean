
// Common shared types used across the application

export type NotificationType = 'system' | 'info' | 'success' | 'warning' | 'error';

export type VoteType = 'up' | 'down' | 'neutral';

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

export type TenantFeature = 'ai_decisions' | 'analytics' | 'plugins' | 'multi_user' | 'api_access';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Common parameters for executing operations
 */
export interface ExecutionParams {
  tenant_id: string;
  user_id?: string;
  dryRun?: boolean;
}

/**
 * Types used for KPI and analytics
 */
export type TrendDirection = 'up' | 'down' | 'flat' | 'neutral';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
}

/**
 * System logging related types
 */
export type SystemEventModule = 
  | 'system' 
  | 'auth' 
  | 'tenant' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'execution' 
  | 'onboarding'
  | 'error'
  | 'admin'
  | 'embeddings';

export type SystemEventType = string;

/**
 * Execution related types
 */
export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'system';

// We've moved ExecutionRecordInput to execution.ts to avoid duplication
