
import { VoteType } from './shared';

// Voting related types
export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  comment?: string;
  created_at: string;
}
