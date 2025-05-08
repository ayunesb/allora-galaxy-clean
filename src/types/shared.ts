export type VoteType = 'upvote' | 'downvote';

export type TrendDirection = 'up' | 'down' | 'flat';

export type SystemEventModule = 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'auth' 
  | 'billing' 
  | 'marketing'
  | 'onboarding';
