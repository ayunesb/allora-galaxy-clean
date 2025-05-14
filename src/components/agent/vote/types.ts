
import { VoteType } from '@/types/shared';

export interface VoteButtonProps {
  type: VoteType;
  count: number;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface AgentVotePanelProps {
  agentVersionId: string;
  upvotes: number;
  downvotes: number;
  isReadOnly?: boolean;
}

export interface CommentSectionProps {
  comments: any[];
  agentVersionId: string;
  userHasVoted: boolean;
  voteType?: VoteType;
  isLoading?: boolean;
  
  // Added props to fix CommentSection errors
  comment?: string;
  setComment?: (comment: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

// Add AgentVoteProps for AgentVotePanel
export interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userId?: string;
}

// Extended hook return type
export interface UseAgentVoteReturn {
  userVote: VoteType | null;
  upvoteCount: number;
  downvoteCount: number;
  upvotes: number; // Alias for upvoteCount
  downvotes: number; // Alias for downvoteCount
  isLoading: boolean;
  submitting: boolean; // Alias for isLoading
  comment: string;
  setComment: (comment: string) => void;
  recentComments: any[];
  showComment: boolean;
  setShowComment: (show: boolean) => void;
  handleVote: (voteType: VoteType) => Promise<void>;
  handleSubmitComment: () => Promise<void>;
  hasVoted: boolean;
}
