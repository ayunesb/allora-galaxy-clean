
// Voting related types
export type VoteType = 'up' | 'down' | 'upvote' | 'downvote';

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}
