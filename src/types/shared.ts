
export interface SystemLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  metadata: any;
  module: string;
  event: string;
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

// Standardized UserRole type
export type UserRole = 'admin' | 'user' | 'owner' | 'member' | 'viewer' | 'guest';

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
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
}

export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  disabled?: boolean;
  label?: string;
  badge?: string | number;
  isNew?: boolean;
  isExternal?: boolean;
  adminOnly?: boolean;
}

export type OnboardingStep = 'company-info' | 'additional-info' | 'persona' | 'strategy-generation' | 'completed';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type SystemEventModule = 'auth' | 'tenant' | 'plugin' | 'agent' | 'strategy' | 'execution' | 'system' | 'admin';
export type SystemEventType = 'created' | 'updated' | 'deleted' | 'executed' | 'failed' | 'info' | 'warning' | 'error';

// Add LogSeverity for consistent logging
export type LogSeverity = 'info' | 'warning' | 'error' | 'debug';

// Add NotificationType to standardize notification types
export type NotificationType = 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'cron' | 'webhook' | 'scheduled';

export interface ExecutionParams {
  [key: string]: any;
}

export type TenantFeature = 'analytics' | 'plugins' | 'agents' | 'strategies' | 'admin' | 'api';

// Standardized VoteType definition
export type VoteType = 'up' | 'down';

// Add KPITrend interface to standardize KPI trends
export interface KPITrend {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  direction?: TrendDirection;
  trend?: 'increasing' | 'decreasing' | 'stable';
  unit?: string;
  target?: number;
}

// Add AuditLog type for consistent usage
export interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  tenant_id: string;
}
