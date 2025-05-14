
export interface SystemLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  metadata: any;
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  timestamp: string;
  level: string;
  message: string;
  input: any;
  output: any;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'owner';

export interface SystemLogFilter {
  module?: string;
  event?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm?: string;
  level?: string;
  limit?: number;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface FilterState {
  searchTerm?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  type?: string;
  status?: string;
  [key: string]: any;
}

export interface FilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  disabled?: boolean;
  label?: string;
  badge?: string;
  id?: string; // Added id property
}

export type OnboardingStep = 'company-info' | 'additional-info' | 'persona' | 'strategy-generation' | 'completed';

// Adding missing types that are referenced in errors
export type VoteType = 'up' | 'down' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'neutral' | 'unchanged';
export type SystemEventModule = 'user' | 'tenant' | 'strategy' | 'plugin' | 'agent' | 'system';
export type SystemEventType = 'info' | 'warning' | 'error' | 'debug';
export type LogSeverity = 'info' | 'warning' | 'error' | 'debug';
export type NotificationType = 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
}

export interface ExecutionType {
  type: string;
  label: string;
  description: string;
}

export interface ExecutionParams {
  [key: string]: any;
}

export interface TenantFeature {
  id: string;
  name: string;
  enabled: boolean;
}
