
// Import VoteType for actual use in the file
import { VoteType } from './shared';

// Voting related types
export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}
