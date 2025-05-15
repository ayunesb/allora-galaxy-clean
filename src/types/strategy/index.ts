
import { LogLevel, LogSeverity } from '../logs';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: StrategyStatus;
  tags?: string[];
  priority?: StrategyPriority;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  tenant_id?: string;
  created_by_ai?: boolean;
  due_date?: string;
}

export type StrategyStatus = 'draft' | 'active' | 'completed' | 'archived' | 'pending' | 'approved' | 'rejected';
export type StrategyPriority = 'low' | 'medium' | 'high' | 'critical';
export type StrategyChangeType = 'creation' | 'update' | 'approval' | 'rejection' | 'execution' | 'parameter_change';

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  change_type: StrategyChangeType;
  description: string;
  parameters?: Record<string, any>;
  created_at: string;
  created_by?: string;
  approved_by?: string;
  status?: StrategyStatus;
  metadata?: Record<string, any>;
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  version: number;
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  start_time: string;
  end_time?: string;
  created_at: string;
  duration_ms?: number;
  executed_by?: string;
  tenant_id?: string;
  metadata?: Record<string, any>;
}

export interface StrategyParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'object';
  description?: string;
  required?: boolean;
  default?: any;
  options?: any[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface StrategyKPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: 'up' | 'down' | 'flat';
  created_at?: string;
  updated_at?: string;
  source?: string;
  category?: string;
}

export interface StrategyLog {
  id: string;
  strategy_id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  created_at?: string;
  user_id?: string;
  details?: Record<string, any>;
  severity?: LogSeverity;
  metadata?: Record<string, any>;
}

export interface StrategyAction {
  id: string;
  strategy_id: string;
  action: 'start' | 'stop' | 'pause' | 'resume' | 'archive' | 'clone' | 'delete';
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface StrategyValidation {
  isValid: boolean;
  errors: Record<string, string>;
  message?: string;
}

// Fixed type for ExecutionLogItem
export interface ExecutionLogItem {
  id: string;
  strategy_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  duration_ms?: number;
  version: number;
}

export * from './fixed';
