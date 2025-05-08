
export type LogStatus = 'pending' | 'running' | 'success' | 'error' | 'warning';

export type VoteType = 'up' | 'down' | 'neutral';

export interface UserBase {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
}
