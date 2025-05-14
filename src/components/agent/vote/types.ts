
import { VoteType } from '@/types/shared';
import { Comment } from '@/types/shared';

export interface VoteButtonProps {
  agentVersionId: string;
  currentVote?: VoteType | null;
  onVoteChange?: (voteType: VoteType) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  upvotes?: number;
  downvotes?: number;
  disabled?: boolean;
  className?: string;
}

export interface CommentSectionProps {
  agentVersionId: string;
  comments?: Comment[];
  onAddComment?: (comment: string) => Promise<void>;
  loading?: boolean;
  maxHeight?: string;
}

export interface UseAgentVoteProps {
  agentVersionId: string;
}

export interface UseAgentVoteResult {
  vote: VoteType | null;
  upvotes: number;
  downvotes: number;
  hasVoted: boolean;
  castVote: (voteType: VoteType, comment?: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}
