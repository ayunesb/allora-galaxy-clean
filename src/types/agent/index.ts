
import { VoteType } from '../shared';

export interface AgentVersionData {
  id: string;
  plugin_id: string;
  version: string;
  prompt: string;
  status: 'active' | 'deprecated';
  xp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  upvotes: number;
  downvotes: number;
}

export interface AgentVote {
  id?: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  comment?: string;
  created_at?: string;
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
  vote: {
    voteType: VoteType;
    comment?: string;
  } | null;
  error?: string;
}
