
// Define the input interface for executing a strategy (camelCase version)
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Define snake_case version for compatibility
export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Define the result interface for a strategy execution (camelCase version)
export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  strategy_id?: string; 
  execution_id?: string;
  execution_time?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
  status?: string;
  message?: string;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  data?: any;
}

// Required types for execution tracking
export type LogStatus = 'pending' | 'running' | 'success' | 'error' | 'warning';

export interface ExecutionRecordInput {
  tenantId: string;
  status: LogStatus;
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

// Tenant and user role definitions
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, any>;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

// Plugin related types
export interface PluginResult {
  pluginId: string;
  status: 'success' | 'failure';
  output?: any;
  error?: string;
  executionTime: number;
  xpEarned: number;
}

export enum VoteType {
  Upvote = 'upvote',
  Downvote = 'downvote',
  Neutral = 'neutral'
}

// Utility functions for case conversion
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) return;
    
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      result[snakeKey] = camelToSnake(obj[key]);
    } else {
      result[snakeKey] = obj[key];
    }
  });
  
  return result;
}

export function snakeToCamel<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) return;
    
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      result[camelKey] = snakeToCamel(obj[key]);
    } else {
      result[camelKey] = obj[key];
    }
  });
  
  return result as T;
}
