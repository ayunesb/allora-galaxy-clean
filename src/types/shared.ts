// Add or update the AuditLog type in the shared types
export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  tenant_id: string;
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

// Other shared types can be kept below
