
import { ExecutionType } from './shared';

/**
 * Record for execution logs
 */
export interface ExecutionRecordInput {
  tenantId: string;
  status: string;
  type: 'strategy' | 'plugin' | 'agent';
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

export interface ExecutionRecord {
  id: string;
  tenant_id: string;
  status: string;
  type: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  input?: any;
  output?: any;
  created_at?: string;
  execution_time?: number;
  xp_earned?: number;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: ExecutionRecord;
  error?: string;
}
