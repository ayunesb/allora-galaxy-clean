
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

// Export the type-safe vote function declaration
export type VoteOnAgentVersionFn = (
  agentVersionId: string, 
  voteType: VoteType, 
  comment?: string
) => Promise<VoteResult>;

// Placeholder function with proper signature
export const voteOnAgentVersion: VoteOnAgentVersionFn = async (
  agentVersionId: string, 
  voteType: VoteType, 
  comment?: string
): Promise<VoteResult> => {
  return {
    success: false,
    upvotes: 0,
    downvotes: 0,
    error: 'Function not implemented'
  };
};

// Wrapper functions with the correct types
export const upvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'up' as VoteType, comment);

export const downvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'down' as VoteType, comment);
