
// Voting related types
export type VoteType = 'upvote' | 'downvote';

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  comment?: string;
  created_at: string;
}
