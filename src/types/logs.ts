
import { Json } from './supabase';
import { SystemEventModule, SystemEventType } from './shared';

export interface BaseLog {
  id: string;
  created_at: string;
  tenant_id?: string | null;
}

export interface AuditLog extends BaseLog {
  event_type: string;
  entity_type: string;
  entity_id: string;
  description?: string | null;
  user_id?: string | null;
  metadata?: Record<string, any> | null;
  // Adding module for compatibility with SystemLog
  module?: string;
  event?: string;
  context?: Json | null;
}

export interface SystemLog extends BaseLog {
  module: SystemEventModule;
  event: SystemEventType;
  description?: string | null;
  context?: Json | null;
  tenant_id?: string | null;
}

export interface LogHistoryFilter {
  module?: string;
  event_type?: string;
  entity_type?: string;
  from_date?: string;
  to_date?: string;
  user_id?: string;
}

// Add a union type for easier handling in components
export type LogEntry = AuditLog | SystemLog;

// Add a helper function to determine log type
export function isSystemLog(log: LogEntry): log is SystemLog {
  return 'module' in log && 'event' in log && !('entity_type' in log);
}

export function getContextPreview(context?: Record<string, any> | Json | null): string {
  if (!context) return 'No data';
  try {
    const entries = Object.entries(context);
    if (entries.length === 0) return 'Empty';
    
    const [key, value] = entries[0];
    const valueStr = typeof value === 'object' 
      ? JSON.stringify(value).substring(0, 15) + '...' 
      : String(value).substring(0, 15);
    
    return `${key}: ${valueStr}${entries.length > 1 ? ` (+ ${entries.length - 1} more)` : ''}`;
  } catch (e) {
    return 'Invalid data';
  }
}
