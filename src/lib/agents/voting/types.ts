
export enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

export interface AgentVote {
  id: string;
  agentVersionId: string;
  userId: string;
  voteType: VoteType;
  comment?: string;
  createdAt: string;
}

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
  upvotes?: number;
  downvotes?: number;
}
