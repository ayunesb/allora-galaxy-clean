
export interface SystemLog {
  id: string;
  created_at: string;
  description: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  tenant_id?: string;
  user_id?: string;
  metadata?: string | Record<string, any>;
  context?: string;
  request_id?: string;
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
