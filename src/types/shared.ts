
// Common shared types used across the application

// Type for vote actions
export type VoteType = 'upvote' | 'downvote';

// Type for system log severity levels
export type LogSeverity = 'info' | 'warning' | 'error' | 'debug';

// Type for system event categories
export type SystemEventType = 'system' | 'user' | 'strategy' | 'agent' | 'plugin';

// Type for system log filters
export interface SystemLogFilter {
  searchTerm: string;
  module?: string;
  severity?: LogSeverity;
  dateRange?: DateRange;
}

// Date range type for filters
export interface DateRange {
  from: Date;
  to?: Date;
}

// Type for notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Type for fixed execution status
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';

// Type for strategy execution input
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Type for strategy execution result
export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  status: string;
  error?: string;
  executionTime?: number;
  outputs?: any;
  results?: any;
  logs?: any;
  xpEarned?: number;
  pluginsExecuted?: number;
  successfulPlugins?: number;
}
