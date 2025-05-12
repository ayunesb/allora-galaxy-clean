
// Types for the execution module

export interface ExecutionRecord {
  id: string;
  tenantId: string;
  status: string;
  type: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
  createdAt: string;
}

export interface ExecutionFilter {
  tenantId: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
