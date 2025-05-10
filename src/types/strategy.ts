
// Strategy related types
export interface Strategy {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress';
  priority?: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  tags?: string[];
  completion_percentage?: number;
  due_date?: string;
  updated_at?: string;
}

export interface StrategyFilter {
  status?: string[];
  query?: string;
  tags?: string[];
  priority?: string[];
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  executed_by?: string;
  results?: Record<string, any>;
}

// Define validation result
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
