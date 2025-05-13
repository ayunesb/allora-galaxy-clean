
// Strategy related types
export interface Strategy {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress';
  priority?: 'low' | 'medium' | 'high' | null;
  created_by: string;
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  tags?: string[] | null;
  completion_percentage?: number | null;
  due_date?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, any> | null;
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
  errors: string[] | Record<string, string>;
}
