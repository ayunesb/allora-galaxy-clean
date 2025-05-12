
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
  | 'marketing';

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
