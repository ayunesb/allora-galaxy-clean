
export interface Log {
  id: string;
  created_at: string;
  event_type: string;
  status: string;
  tenant_id: string;
  metadata: any;
  message?: string;
  level?: string;
  source?: string;
  user_id?: string;
}

export interface LogEntry extends Log {
  details?: string;
  timestamp?: string;
  context?: Record<string, any>;
}

export interface LogGroup {
  id: string;
  message: string;
  count: number;
  lastOccurred: string;
  status: string;
  firstOccurred: string;
}

export interface ErrorLog extends Log {
  error_message: string;
  error_stack?: string;
  error_type?: string;
  handled: boolean;
  source_location?: {
    file: string;
    line: number;
    column: number;
  };
}

export interface LogFilter {
  level?: string[];
  source?: string[];
  status?: string[];
  timeRange?: [Date | null, Date | null];
  search?: string;
}
