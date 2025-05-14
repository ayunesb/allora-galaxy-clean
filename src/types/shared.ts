
// Common shared types used throughout the application

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type VoteType = 'up' | 'down';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type SystemEventType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'error';
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface FilterState {
  search?: string;
  dateRange?: DateRange;
  status?: string[];
  type?: string[];
  user?: string;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  [key: string]: any;
}

export interface DateRange {
  from: Date | string | null;
  to: Date | string | null;
}

export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  items?: NavigationItem[];
  badge?: string | number;
  permission?: string;
}

export interface KPITrend {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  direction?: TrendDirection;
  category?: string;
  source?: string;
  date: string;
}

export interface TenantFeature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface SystemLogFilter {
  module?: string[];
  severity?: LogSeverity[];
  dateRange?: DateRange;
  search?: string;
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
}
