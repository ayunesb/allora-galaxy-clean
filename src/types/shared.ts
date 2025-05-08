
// Shared types used across the application
export type VoteType = 'up' | 'down' | 'neutral';

export type LogStatus = 'success' | 'failure' | 'partial' | 'pending' | 'running' | 'error' | 'warning';

export type StrategyStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'draft';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPITrend {
  id: string;
  name: string;
  change: number;
  trend: TrendDirection;
  currentValue: number;
  previousValue: number | null;
  unit: string;
  category: string;
}

export interface ExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  status?: LogStatus;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Add missing status type for StrategyBuilder
export type StrategyExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'partial';
