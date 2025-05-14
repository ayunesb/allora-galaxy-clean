
import { VoteType } from '@/types/shared';

export interface VoteParams {
  agentVersionId: string;
  userId: string;
  voteType: VoteType;
  comment?: string;
}

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}

export interface AgentVoteStats {
  upvotes: number;
  downvotes: number;
  total: number;
  ratio: number;
}

export interface UserVoteData {
  voteType: VoteType;
  comment?: string | null;
}

export interface UserVoteResponse {
  hasVoted: boolean;
  vote: UserVoteData | null;
}

export interface CommentData {
  id: string;
  content: string;
  vote_type: VoteType;
  created_at: string;
  user_id: string;
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  } | null;
}
