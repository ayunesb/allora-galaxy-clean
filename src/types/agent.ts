
import { VoteType } from './shared';

export interface AgentVersion {
  id: string;
  version: string;
  prompt: string;
  status: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  created_at: string;
  updated_at: string;
  plugin_id?: string;
  created_by?: string;
}

export interface AgentVersionVote {
  voteType: VoteType;
  comment?: string;
}

export interface UserVoteInfo {
  success: boolean;
  hasVoted: boolean;
  vote: AgentVersionVote | null;
  error?: string;
}

export interface VoteResult {
  success: boolean;
  message?: string;
  upvotes: number;
  downvotes: number;
  error?: string;
}
