
export interface SystemLog {
  id: string;
  created_at: string;
  tenant_id?: string;
  module: string;
  event_type: string;
  user_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  // Adding properties that were missing
  severity?: 'low' | 'medium' | 'high' | 'critical';
  user_facing?: boolean;
  affects_multiple_users?: boolean;
  message?: string;
  type?: string;
  error_type?: string;
}

export interface LogFilters {
  search?: string;
  module?: string[];
  event_type?: string[];
  date_range?: { from: Date; to: Date | null };
  user_id?: string;
  tenant_id?: string;
  // Adding missing property
  severity?: string[];
}

export interface ErrorGroup {
  id: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorType: string;
  tenant_id?: string;
}
