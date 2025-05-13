
export interface SystemLog {
  id: string;
  module: string;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

export interface AuditLog extends SystemLog {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
}

export interface AiDecision extends SystemLog {
  decision_type: string;
  reviewed: boolean;
  review_outcome: string | null;
  review_comment: string | null;
  reviewer_id: string | null;
  review_date: string | null;
}

export interface LogFilters {
  module?: string;
  event?: string;
  tenant_id?: string;
  search?: string;
  date_from?: Date | null;
  date_to?: Date | null;
  limit?: number;
  offset?: number;
}

export interface SystemLogFilterState {
  module: string;
  event: string;
  searchTerm: string;
  fromDate: Date | null;
  toDate: Date | null;
}

export interface AuditLogFilterState extends SystemLogFilterState {
  // Add any audit-log specific filters here
}
