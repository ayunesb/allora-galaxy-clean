
export interface Agent {
  id: string;
  name: string;
  description?: string;
  version?: string;
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive' | 'deprecated';
  xp?: number;
  plugin_id?: string;
  tenant_id: string;
}

export interface AgentVersion {
  id: string;
  version: string;
  prompt: string;
  status: 'active' | 'inactive' | 'deprecated';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  plugin_id?: string;
  upvotes: number;
  downvotes: number;
  xp: number;
}

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  comment?: string;
  created_at: string;
}

export interface AgentVoteInput {
  agentVersionId: string;
  voteType: 'upvote' | 'downvote';
  comment?: string;
}

export interface AgentVoteResult {
  success: boolean;
  vote?: AgentVote;
  error?: string;
}

export interface AgentPerformance {
  agentVersionId: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  upvoteRatio: number;
  xpGained: number;
}
