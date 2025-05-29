import { VoteType } from "@/types/shared";

export interface UserVote {
  voteType: VoteType;
  comment?: string;
}

export interface UserVoteInfo {
  hasVoted: boolean;
  vote: UserVote | null;
}

export interface VoteResult {
  success: boolean;
  message?: string;
  error?: string;
  upvotes: number;
  downvotes: number;
}

export interface AgentVoteStats {
  upvotes: number;
  downvotes: number;
  total: number;
  ratio: number;
}

export type VoteStats = AgentVoteStats;

export type CastVoteFn = (
  agentVersionId: string,
  voteType: VoteType,
  comment?: string,
) => Promise<VoteResult>;
export type UpvoteAgentVersionFn = (
  agentVersionId: string,
  comment?: string,
) => Promise<VoteResult>;
export type DownvoteAgentVersionFn = (
  agentVersionId: string,
  comment?: string,
) => Promise<VoteResult>;
