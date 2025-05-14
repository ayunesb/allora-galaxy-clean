
export interface SystemLog {
  id: string;
  created_at: string;
  description: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  tenant_id?: string;
  user_id?: string;
  metadata?: any;
  context?: string;
  request_id?: string;
  error?: string;
  error_type?: string;
  message?: string;
  event?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  user_facing?: boolean;
  affects_multiple_users?: boolean;
}

export interface SystemLogGroup {
  id: string;
  error_message: string;
  error_type: string;
  count: number;
  first_seen: string;
  last_seen: string;
  environment: string;
  status: 'open' | 'resolved' | 'ignored';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorImpact {
  users_affected: number;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  tenants_affected: string[];
  components_affected: string[];
}

export interface LogFilters {
  level?: string[];
  module?: string[];
  fromDate?: string;
  toDate?: string;
  search?: string;
  tenant_id?: string;
  error_type?: string[];
  severity?: string[];
}
