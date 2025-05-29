export interface Strategy {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_user?: {
    id: string;
    email: string;
    name?: string;
  };
  status: "draft" | "pending_review" | "approved" | "rejected" | "archived";
  version: number;
  tenant_id: string;
  config: Record<string, any>;
  parameters?: Record<string, any>;
  tags?: string[];
  category?: string;
  is_template?: boolean;
  is_public?: boolean;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  last_execution_at?: string;
  last_execution_status?: "success" | "failure" | "pending";
  execution_count?: number;
  success_rate?: number;
  average_duration_ms?: number;
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  created_at: string;
  created_by: string;
  changes: Record<string, any>;
  config: Record<string, any>;
  parameters?: Record<string, any>;
  description?: string;
  change_summary?: string;
  change_type?: "major" | "minor" | "patch";
  approval_status?: "pending" | "approved" | "rejected";
  approved_at?: string;
  approved_by?: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  diff?: Record<string, any>;
}

export interface StrategyExecution {
  id: string;
  strategy_id: string;
  version: number;
  start_time: string;
  end_time?: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  created_by?: string;
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  duration_ms?: number;
  logs?: ExecutionLogItem[];
  metadata?: Record<string, any>;
}

export interface ExecutionLogItem {
  id: string;
  execution_id: string;
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error";
  metadata?: Record<string, any>;
  step?: string;
}

export type StrategyChangeType = "major" | "minor" | "patch";

export interface StrategyFormData {
  name: string;
  description: string;
  config: Record<string, any>;
  parameters?: Record<string, any>;
  tags?: string[];
  category?: string;
}
