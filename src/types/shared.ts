
// Common shared types used across the application

export type NotificationType = 'system' | 'info' | 'success' | 'warning' | 'error';

export type VoteType = 'up' | 'down' | 'neutral';

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

export type TenantFeature = 'ai_decisions' | 'analytics' | 'plugins' | 'multi_user' | 'api_access';

export type UserRole = 'admin' | 'owner' | 'member' | 'viewer' | 'guest';

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
