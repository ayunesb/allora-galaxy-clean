
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

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  isActive: boolean;
  component: React.ComponentType<any>;
}

export interface OnboardingData {
  companyName: string;
  industry: string;
  size: string;
  description?: string;
  goals: string[];
  persona?: {
    name: string;
    tone: string;
    goals: string[];
  };
}

export interface AgentVersion {
  id: string;
  plugin_id: string;
  prompt: string;
  status: string;
  version: string;
  downvotes: number;
  upvotes: number;
  created_at: string;
  updated_at: string;
  xp: number;
}

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}

export interface AgentEvolution {
  id: string;
  original_id: string;
  plugin_id: string;
  prompt: string;
  status: string;
  version: string;
  created_at: string;
  feedback_used: string[];
}
