
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  tenant_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  priority?: 'low' | 'medium' | 'high';
  completion_percentage?: number;
  tags?: string[];
  created_by_ai?: boolean;
  due_date?: string;
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  content: string;
  changes: string;
  created_at: string;
  created_by: string;
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executed_by: string;
  execution_time?: number;
}

export interface StrategyMetrics {
  strategy_id: string;
  executions_count: number;
  success_rate: number;
  average_execution_time: number;
  last_execution_at?: string;
}
