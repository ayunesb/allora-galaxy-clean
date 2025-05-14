
import { VoteType } from './shared';

// Voting related types
export { VoteType };

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}
