export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any> | null;
}

export interface CronExecution {
  id: string;
  job_id: string;
  start_time: string;
  end_time: string | null;
  status: "success" | "error" | "running";
  error_message: string | null;
  result: any;
  created_at: string;
}

export interface CronJobStat {
  status: string;
  count: number;
}

export interface TimeRange {
  value: string;
  label: string;
}
