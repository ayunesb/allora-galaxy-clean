
/**
 * Common types used across edge functions
 */

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
  request_id: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  request_id: string;
}

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  execution_id?: string;
  strategy_id?: string;
  status?: string;
  error?: string;
  details?: any;
  execution_time?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
}

export interface CronJobExecution {
  job_id: string;
  job_name: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export type RetryableOperation<T> = () => Promise<T>;

export interface RetryConfig {
  retries?: number;
  delay?: number;
  backoff?: boolean;
  retryIf?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}
