
import { z } from 'zod';

// Define log level type
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

// Define log severity type
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

// Interface for system logs
export interface SystemLog {
  id: string;
  tenant_id: string;
  level: LogLevel;
  message: string;
  description?: string;
  module?: string;
  details?: Record<string, any>;
  created_at: string;
  severity?: LogSeverity;
  request_id?: string;
}

// Define filter interface for system logs
export interface LogFilters {
  search?: string;
  level?: string[];
  module?: string[];
  severity?: string[];
  dateRange?: {
    from: Date;
    to?: Date;
  };
}

// Schema for validating log filters
export const LogFiltersSchema = z.object({
  search: z.string().optional(),
  level: z.array(z.string()).optional(),
  module: z.array(z.string()).optional(),
  severity: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date().optional(),
  }).optional(),
});

// Types for the log filter form
export interface LogFilterForm {
  search: string;
  level: string;
  module: string;
  severity: string;
  dateRange?: {
    from: Date;
    to?: Date;
  };
}
