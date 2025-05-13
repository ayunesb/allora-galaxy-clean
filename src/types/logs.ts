
export interface SystemLog {
  id: string;
  module: string;
  event: string;
  level?: string;
  description?: string;
  context?: Record<string, any>;
  tenant_id?: string;
  created_at: string;
  user_id?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  tenant_id: string;
  details: Record<string, any>;
  created_at: string;
  // Fields needed for compatibility with SystemLog
  module: string;
  event: string;
  description?: string;
  context?: Record<string, any>;
}

export interface LogFilters {
  searchTerm?: string;
  module?: string;
  event?: string;
  tenant_id?: string;
  date_from?: Date;
  date_to?: Date;
  fromDate?: Date | null;
  toDate?: Date | null;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface SystemLogFilterState {
  module: string;
  event: string;
  searchTerm: string;
  fromDate: Date | null;
  toDate: Date | null;
}

export interface AuditLogFilterState {
  module: string;
  event: string;
  searchTerm: string;
  fromDate: Date | null;
  toDate: Date | null;
}
