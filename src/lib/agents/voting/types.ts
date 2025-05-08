
import { VoteType } from '@/types/shared';

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
