
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionMetric {
  id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  status: ExecutionStatus;
  success: boolean;
  error?: string;
  resource_type: string;
  resource_id: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionProgress {
  id: string;
  execution_id: string;
  progress: number; // 0-100
  status?: string;
  message?: string;
  timestamp: string;
}

export interface ExecutionSummary {
  total: number;
  success: number;
  failed: number;
  averageDuration: number;
  timeWindow: string;
}
