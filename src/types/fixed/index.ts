
// Export types from the agent module
export * from '../agent';

// Export types from the plugin module without PluginResult which would cause ambiguity
export type { 
  Plugin, 
  PluginLog
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

// Define ExecuteStrategyInput interface
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Define the snake_case version for API compatibility
export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Define ExecuteStrategyResult interface
export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  executionTime: number;
  status: 'success' | 'partial' | 'failure' | 'error' | string;
  error?: string;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  xpEarned?: number;
  results?: any;
  outputs?: any;
  logs?: any[];
}
