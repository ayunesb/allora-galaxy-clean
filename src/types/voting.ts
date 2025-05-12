
// Voting related types
import { VoteType as SharedVoteType } from './shared';

export type VoteType = SharedVoteType;

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}
