
// Common shared types used across the application

// KPI Trend Types
export type TrendDirection = 'up' | 'down' | 'stable';

export interface KPITrend {
  value: number;
  previousValue?: number;
  percentChange?: number;
  direction: TrendDirection;
  isPositive: boolean;
}

// Vote types
export type VoteType = 'up' | 'down' | 'neutral' | null;

// Execution record types
export type ExecutionType = 'agent' | 'strategy' | 'plugin';

export type LogStatus = 'success' | 'failure' | 'pending' | 'running' | 'warning' | 'error';

export interface ExecutionRecordInput {
  tenantId: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  status: LogStatus;
  type: ExecutionType;
  input: any;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
  executedBy?: string;
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// System event types
export type SystemEventModule = 'system' | 'agent' | 'strategy' | 'plugin' | 'user' | 'tenant' | 'onboarding';

export type SystemEventType = 
  | 'agent_evolved'
  | 'agent_created'
  | 'strategy_executed'
  | 'strategy_approved'
  | 'strategy_rejected'
  | 'plugin_executed'
  | 'user_invited'
  | 'user_joined'
  | 'tenant_created'
  | 'error'
  | 'onboarding_step_change'
  | 'step_completed'
  | 'agent_voted';

// Sortable and filterable collection types
export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  label: string;
  value: string;
}

// Common pagination type
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  total: number;
}

// App-wide metadata types
export interface MetaTag {
  name: string;
  content: string;
}
