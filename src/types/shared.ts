
// Adding this content if it doesn't exist or needs to be updated
export type VoteType = 'upvote' | 'downvote';

export type SystemEventModule = 
  | 'system' 
  | 'auth' 
  | 'billing' 
  | 'agent' 
  | 'strategy' 
  | 'plugin' 
  | 'product' 
  | 'marketing'
  | 'user'
  | 'tenant';

export type SystemEventType = 
  | 'login' 
  | 'signup' 
  | 'logout'
  | 'password_reset'
  | 'kpi_updated'
  | 'agent_vote'
  | 'execute'
  | 'approval'
  | 'rejection'
  | 'generation'
  | 'error';

export interface DateRange {
  from: Date;
  to?: Date;
}

export type UserRole = 'admin' | 'owner' | 'user' | 'viewer';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface KPITrend {
  direction: TrendDirection;
  percentage: number;
  value: number;
}
