
export type SystemEventModule = 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'auth' 
  | 'system' 
  | 'tenant'
  | 'execution'
  | 'user'
  | string;

export type SystemEventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'executed'
  | 'evolved'
  | 'approved'
  | 'rejected'
  | 'success'
  | 'failure'
  | 'error'
  | 'warning'
  | 'info'
  | string;

export type VoteType = 'upvote' | 'downvote';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  tenant_id?: string;
  priority?: string;
  tags?: string[];
  due_date?: string;
  completion_percentage?: number;
}
