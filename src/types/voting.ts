
export type VoteType = 'up' | 'down' | 'none';

export interface Vote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  total: number;
  userVote?: VoteType;
}

export interface VoteParams {
  agentVersionId: string;
  voteType: VoteType;
  comment?: string;
  userId: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  voteStats?: VoteStats;
}
