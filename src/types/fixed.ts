
// Add necessary strategy types if not already defined

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, unknown>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  execution_id?: string;
  executionTime?: number;
  message?: string;
  status?: 'success' | 'partial' | 'failure';
  plugins_executed?: number;
  successful_plugins?: number;
}

export interface PluginResult {
  pluginId: string;
  status: LogStatus;
  output?: any;
  error?: string;
  executionTime: number;
  xpEarned: number;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  error?: string;
}

export type LogStatus = 'success' | 'failure' | 'pending';

// Additional types needed based on build errors
export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface CompanyProfile {
  id: string;
  tenant_id: string;
  name: string;
  industry?: string;
  size?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentVote {
  id?: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at?: string;
}

export type VoteType = 'up' | 'down';

export interface ExecutionRecordInput {
  tenantId: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: LogStatus;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

// Helper functions for snake_case <-> camelCase conversion
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as Record<string, any>);
}

export function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as Record<string, any>);
}
