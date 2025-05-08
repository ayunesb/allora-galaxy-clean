
import { LogStatus } from "./shared";

/**
 * Input data for recording an execution
 */
export interface ExecutionRecordInput {
  tenantId: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: LogStatus;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

/**
 * Execution record as stored in the database
 */
export interface Execution {
  id: string;
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: LogStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  created_at: string;
}
