
import { Dispatch, SetStateAction } from 'react';

export interface AgentVoteProps {
  agentVersionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userId: string;
}

export interface VoteButtonProps {
  type: 'up' | 'down';
  count: number;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}

export interface CommentSectionProps {
  comments: string[];
  commentValue: string;
  setCommentValue: Dispatch<SetStateAction<string>>;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}
