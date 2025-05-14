
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'user'
  | 'tenant'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'billing'
  | 'notification'
  | 'execution'
  | 'cron'
  | 'integration';

export interface SystemLogFilter {
  searchTerm?: string;
  module?: SystemEventModule;
  level?: 'info' | 'warning' | 'error';
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogFilter {
  searchTerm?: string;
  module?: SystemEventModule;
  startDate?: Date;
  endDate?: Date;
}

// VoteType for agent feedback
export type VoteType = 'up' | 'down' | 'upvote' | 'downvote' | null;
