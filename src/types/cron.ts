
/**
 * Types for CRON job monitoring and management
 */

// Common status type shared across interfaces
export type CronJobStatus = 'success' | 'failure' | 'running' | 'scheduled' | 'active' | 'inactive' | 'failed' | 'completed';

export interface CronJob {
  id: string;
  name: string;
  schedule: string | null;
  last_run: string | null;
  next_run: string | null;
  status: CronJobStatus;
  function_name: string;
  created_at: string;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

export interface CronJobExecution extends CronJob {
  execution_id?: string;
  result?: any;
}

export interface CronJobStat {
  status: string;
  count: number;
}

export interface CronJobStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  completed: number;
}

export interface TimeRange {
  value: string;
  label: string;
}
