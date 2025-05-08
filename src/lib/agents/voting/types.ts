
import { VoteType } from '@/types/fixed';

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

export type UserVoteInfo = UserVote;
export type VoteStats = AgentVoteStats;

// Update exported types to be compatible with existing code
export const voteOnAgentVersion = async (agentVersionId: string, voteType: VoteType, comment?: string): Promise<VoteResult> => {
  // This is a placeholder implementation that should be overridden by the actual implementation
  return {
    success: false,
    upvotes: 0,
    downvotes: 0,
    error: 'Function not implemented'
  };
};

// Expose wrapper functions for compatibility
export const upvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'up', comment);

export const downvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  voteOnAgentVersion(agentVersionId, 'down', comment);
