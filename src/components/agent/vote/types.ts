
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
}
