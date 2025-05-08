
export interface AgentVersion {
  id: string;
  plugin_id: string;
  prompt: string;
  status: string;
  version: string;
  downvotes: number;
  upvotes: number;
  created_at: string;
  updated_at: string;
  xp: number;
}

export interface VoteResult {
  success: boolean;
  voteId?: string;
  error?: string;
}

export interface AgentEvolution {
  id: string;
  original_id: string;
  plugin_id: string;
  prompt: string;
  status: string;
  version: string;
  created_at: string;
  feedback_used: string[];
}
