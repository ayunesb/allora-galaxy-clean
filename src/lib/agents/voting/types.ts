
import { VoteType } from "@/types/fixed";

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
