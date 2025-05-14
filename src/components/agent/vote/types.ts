
// Import VoteType from shared types
import { VoteType } from '@/types/shared';

export { VoteType }; // Export VoteType to fix the error

export interface Vote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface VoteButtonProps {
  count: number;
  active: boolean;
  type: VoteType;
  disabled: boolean;
  onClick: () => void;
}

export interface UseAgentVoteProps {
  agentVersionId: string;
}

export interface UseAgentVoteResult {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
  comments: Comment[];
  isSubmitting: boolean;
  handleUpvote: () => Promise<void>;
  handleDownvote: () => Promise<void>;
  handleCommentSubmit: (comment: string) => Promise<void>;
}

export interface CommentSectionProps {
  comments: Comment[];
  onSubmitComment?: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
}
