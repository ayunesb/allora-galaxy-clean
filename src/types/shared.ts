import { DateRange } from '@/components/ui/date-range-picker';

export type SystemEventModule = 
  | 'agent'
  | 'system'
  | 'plugin'
  | 'strategy'
  | 'auth'
  | 'kpi'
  | 'marketing'
  | 'tenant'
  | 'user'
  | string;

export interface FilterState {
  searchTerm?: string;
  dateRange?: DateRange;
  eventType?: string;
  userId?: string;
  [key: string]: any;
}

export interface SystemLogFilter {
  searchTerm?: string;
  module?: string | string[];
  event?: string;
  dateRange?: DateRange;
  tenant?: string;
}
