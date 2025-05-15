
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  approved_by?: string;
  created_by?: string;
  priority?: string;
  tags?: string[];
  tenant_id?: string;
  due_date?: string;
  completion_percentage?: number;
}

export interface StrategyExecutionResult {
  success: boolean;
  strategyId?: string;
  executionId?: string;
  error?: string;
  status?: string;
}

export interface StrategyInput {
  title: string;
  description: string;
  priority?: string;
  tags?: string[];
  due_date?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Update StrategyVersion to include change_type and description
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
  change_type?: string; // Add change_type field
  description?: string; // Add description field
}

// Update StrategyExecution with required properties
export interface StrategyExecution {
  id: string;
  strategy_id: string;
  status: 'success' | 'failure' | 'running' | 'pending';
  start_time: string;
  end_time?: string;
  execution_time?: number;
  result?: any; // Ensure this is named result (not results)
  error?: string;
  executed_by?: string;
  tenant_id?: string;
  version?: string; // Add version field for component compatibility
  duration_ms?: number; // Add duration_ms field for component compatibility
  created_at?: string; // Add created_at field for component compatibility
}

// Add this interface for use with the useStrategyEvolution hook
export interface UseStrategyEvolutionResult {
  strategy: Strategy | null;
  versions: StrategyVersion[];
  executions: StrategyExecution[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Add this for the ExecutionLogs component
export interface ExecutionLogItem extends StrategyExecution {
  // Add any additional fields needed by ExecutionLogs component
}
