
import { VoteType } from '@/types/shared';

export interface VoteButtonProps {
  count: number;
  active: boolean;
  type: 'up' | 'down';
  onClick: () => void;
  disabled: boolean;
}

export interface CommentSectionProps {
  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
  agentVersionId?: string;
  userHasVoted?: boolean;
  voteType?: VoteType;
  isLoading?: boolean;
}

export interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userId: string;
}
