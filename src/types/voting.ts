
export type VoteType = 'upvote' | 'downvote';

export interface Vote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
  comment?: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  userVote?: Vote;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  vote?: Vote;
}
