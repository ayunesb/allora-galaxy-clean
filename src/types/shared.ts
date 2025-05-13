
// Shared types for the application
export type SystemEventModule = 
  'system' | 
  'user' | 
  'auth' | 
  'tenant' | 
  'billing' | 
  'strategy' | 
  'plugin' | 
  'agent' | 
  'webhook' |
  string; // Allow string for future modules

export type SystemEventType = 
  'info' | 
  'error' | 
  'warning' | 
  'create' | 
  'update' | 
  'delete' | 
  'login' | 
  'logout' |
  string; // Allow string for future event types

// Type for date range picker
export interface DateRange {
  from: Date;
  to?: Date;
}
