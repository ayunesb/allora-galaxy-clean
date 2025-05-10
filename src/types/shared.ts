
// Add DateRange type if it doesn't exist
export interface DateRange {
  from: Date;
  to?: Date | null;
}

// Also ensure AuditLog type is properly defined
export interface AuditLog {
  id: string;
  module: string;
  event_type: string;
  description: string;
  tenant_id: string;
  created_at: string;
  metadata?: any;
}

// Define SystemEventModule type
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'tenant'
  | 'user'
  | 'execution'
  | 'onboarding'
  | 'kpi'
  | 'notification'
  | 'cron'
  | 'integration';

// Define SystemEventType
export type SystemEventType =
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'success'
  | 'failure'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'executed'
  | 'scheduled';

// Define OnboardingStep
export type OnboardingStep =
  | 'company-info'
  | 'persona'
  | 'additional-info'
  | 'strategy-generation';
