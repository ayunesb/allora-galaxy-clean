
import { VoteType } from '@/types/shared';

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
  upvotes: number;
  downvotes: number;
  message?: string;
}

export interface AgentVoteStats {
  agentVersionId: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  totalVotes: number;
  ratio?: number;
  recentComments?: any[];
  userVote?: {
    id: string;
    voteType: VoteType;
    comment?: string;
  };
}

export interface UserVote {
  id?: string;
  agentVersionId: string;
  userId?: string;
  voteType: VoteType;
  comment?: string;
  createdAt?: string;
  success?: boolean;
  hasVoted?: boolean;
  vote?: any;
  error?: string;
}

export type UserVoteInfo = UserVote;
export type VoteStats = AgentVoteStats;

// Type declaration for the castVote function
export type CastVoteFn = (
  agentVersionId: string,
  userId: string,
  voteType: VoteType,
  comment?: string
) => Promise<VoteResult>;

// Type declarations for the upvote/downvote wrapper functions
export type UpvoteAgentVersionFn = (
  agentVersionId: string,
  userId: string,
  comment?: string
) => Promise<VoteResult>;

export type DownvoteAgentVersionFn = (
  agentVersionId: string,
  userId: string,
  comment?: string
) => Promise<VoteResult>;
