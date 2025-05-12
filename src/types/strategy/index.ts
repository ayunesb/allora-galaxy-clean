
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

// Use specific ValidationResult for strategy
export interface StrategyValidationResult {
  valid: boolean;
  errors: string[];
}

// Export ValidationResult with StrategyValidationResult alias
export type ValidationResult = StrategyValidationResult;
