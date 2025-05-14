
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

export interface VoteResult {
  success: boolean;
  upvotes?: number;
  downvotes?: number;
  message?: string;
  error?: string;
  voteId?: string;
}

export interface VoteStats {
  success: boolean;
  upvotes: number;
  downvotes: number;
  xp: number;
  totalVotes: number;
  ratio: number;
  recentComments: CommentData[];
  error?: string;
}

export interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  vote_type: VoteType;
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface UserVoteInfo {
  success: boolean;
  hasVoted: boolean;
  vote: AgentVote | null;
  error?: string;
}
