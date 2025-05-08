
import { VoteType } from '@/types/fixed';

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
  upvotes: number;
  downvotes: number;
  message?: string; // Added missing property
}

export interface AgentVoteStats {
  agentVersionId: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  totalVotes: number;
  userVote?: {
    id: string;
    voteType: VoteType;
    comment?: string;
  };
}

export interface UserVote {
  id: string;
  agentVersionId: string;
  userId: string;
  voteType: VoteType;
  comment?: string;
  createdAt: string;
}

// Add missing interfaces required by other files
export type UserVoteInfo = UserVote;
export type VoteStats = AgentVoteStats;
