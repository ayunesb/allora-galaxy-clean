
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
