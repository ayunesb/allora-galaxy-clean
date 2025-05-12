
import { VoteType } from "../shared";

export interface AgentVersionData {
  id: string;
  plugin_id?: string | null;
  version: string;
  prompt: string;
  status: 'active' | 'deprecated';
  xp?: number | null;
  created_at: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  upvotes?: number | null;
  downvotes?: number | null;
}

export interface AgentVote {
  id?: string;
  agent_version_id: string | null;
  user_id: string | null;
  vote_type: VoteType;
  comment?: string | null;
  created_at?: string | null;
}

export interface VoteResult {
  success: boolean;
  upvotes: number;
  downvotes: number;
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
  recentComments: any[];
  error?: string;
}

export interface UserVoteInfo {
  success: boolean;
  hasVoted: boolean;
  vote: any | null;
  error?: string;
}
