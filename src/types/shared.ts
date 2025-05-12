
// Common shared types across the application

// Date range type for date pickers
export interface DateRange {
  from: Date;
  to?: Date;
}

// Vote types used in agent voting
export type VoteType = 'up' | 'down' | 'upvote' | 'downvote';

// Audit log and system log related types
export interface BaseLog {
  id: string;
  created_at: string;
  tenant_id?: string;
}

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'completed';
