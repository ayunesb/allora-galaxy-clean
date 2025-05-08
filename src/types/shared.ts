
// Shared types used across the application
export type VoteType = 'up' | 'down';

export type LogStatus = 'success' | 'failure' | 'partial' | 'pending';

export type StrategyStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';

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
