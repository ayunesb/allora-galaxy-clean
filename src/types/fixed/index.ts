
// Re-export necessary types from the main type system
export * from '../plugin';
export * from '../agent';
export * from '../strategy';
export * from '../execution';

// Re-export utility functions
export { camelToSnake, camelToSnakeObject } from '@/lib/utils/dataConversion';

// Define LogStatus type (without re-exporting the conflicting one)
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

export interface ExecutionRecordInput {
  tenantId: string;
  status: string;
  type: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: any;
  output?: any;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
}

// Ensure the VoteType matches the shared type
export type { PluginResult } from '../plugin';

// We're aligning with the shared.ts definition to ensure consistency
export { type VoteType } from '../shared';

// Export these directly rather than re-exporting from shared to avoid conflicts
export type { 
  UserRole,
  NavigationItem,
  TrendDirection,
  SystemEventModule,
  SystemEventType,
  OnboardingStep,
  BaseEntity,
  ExecutionParams,
  ExecutionType,
  KPITrend,
  TenantFeature,
  LogSeverity,
  NotificationType
} from '../shared';
