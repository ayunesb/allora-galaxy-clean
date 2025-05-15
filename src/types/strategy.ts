
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  completion_percentage?: number;
  due_date?: string;
  tenant_id?: string;
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: string;
  content: string;
  status: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approval_date?: string;
  changes?: string[];
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  status: 'success' | 'failure' | 'running' | 'pending';
  start_time: string;
  end_time?: string;
  execution_time?: number;
  result?: any;
  error?: string;
  executed_by?: string;
  tenant_id?: string;
}

export interface StrategyExecutionStats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
}
