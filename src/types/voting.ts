
export type VoteType = 'up' | 'down';

export interface Vote {
  id: string;
  agent_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface VoteCount {
  upvotes: number;
  downvotes: number;
  total: number;
}

export interface VoteStats extends VoteCount {
  score: number; // score from -1 to 1
  userVote?: VoteType;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
  data?: {
    vote?: Vote;
    stats?: VoteStats;
  };
}
