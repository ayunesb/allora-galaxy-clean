
// Export types from the agent module
export * from '../agent';
// Export types from the plugin module without PluginResult which would cause ambiguity
export type { 
  Plugin, 
  PluginConfig, 
  PluginInput, 
  PluginLog,
  PluginExecution
} from '../plugin';

// Re-export strategy types
export * from '../strategy';

// Export types related to execution
export * from './execution';

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

// We're aligning with the shared.ts definition to ensure consistency
export type { VoteType } from '../shared';

// Export these directly rather than re-exporting from shared to avoid conflicts
export type { 
  UserRole,
  TrendDirection,
  SystemEventModule,
  SystemEventType,
  KPITrend,
  DateRange
} from '../shared';
