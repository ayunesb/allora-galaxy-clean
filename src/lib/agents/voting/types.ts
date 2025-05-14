
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
