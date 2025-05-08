
// Re-export necessary types from the main type system
export * from '../plugin';
export * from '../agent';
export * from '../strategy';
export * from '../shared';
export * from '../execution';
export * from '../tenant';

// Export RunPluginChainResult specifically as it's needed
export type { RunPluginChainResult } from '../plugin';

// Legacy type definitions for backward compatibility
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
