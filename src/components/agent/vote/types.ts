
import { VoteType } from '@/types/shared';

export interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userId?: string;
}

export interface VoteButtonProps {
  count: number;
  isActive: boolean;
  type: 'up' | 'down';
  onClick: () => void;
  disabled: boolean;
}

export interface CommentSectionProps {
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
}

export interface UseAgentVoteParams {
  agentVersionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userId?: string;
}

export interface UseAgentVoteReturn {
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  comment: string;
  setComment: (comment: string) => void;
  showComment: boolean;
  setShowComment: (show: boolean) => void;
  submitting: boolean;
  handleVote: (voteType: VoteType) => Promise<void>;
  handleSubmitComment: () => void;
}
