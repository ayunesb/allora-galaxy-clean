
// Define common shared types for the application

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  tenant_id: string;
  metadata?: any;
  created_at: string;
}

// Add other shared types as needed

