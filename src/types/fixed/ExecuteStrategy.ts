
// Types for edge functions and responses

export type LogStatus = 'pending' | 'success' | 'failure' | 'partial';

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  strategyId?: string;
  status?: LogStatus;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
  outputs?: Record<string, any>;
  logs?: Array<any>;
}

export interface ExecutionRecordInput {
  tenantId: string;
  status: LogStatus;
  type: 'strategy' | 'plugin' | 'agent';
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

export interface KpiInput {
  tenantId: string;
  name: string;
  value: number;
  previousValue?: number;
  date?: string;
  category?: string;
  source?: string;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
}

export interface TenantData {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceContextValue {
  tenantId: string | null;
  setTenantId: (id: string) => void;
  tenantData: TenantData | null;
  isLoading: boolean;
  error: string | null;
}
