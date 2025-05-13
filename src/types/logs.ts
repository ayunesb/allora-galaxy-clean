
export interface SystemLog {
  id: string;
  module: string;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
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
