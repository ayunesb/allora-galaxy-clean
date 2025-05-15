
export interface AgentVersion {
  id: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  prompt: string;
  created_at: string;
  updated_at?: string;
  plugin_id: string;
  upvotes: number;
  downvotes: number;
  xp: number;
}

export interface AgentPerformanceData {
  successRate: number;
  averageXp: number;
  totalExecutions: number;
  errorRate: number;
  averageExecutionTime: number;
  upvoteRate?: number;
}

export interface AgentEvolutionHistory {
  id: string;
  version: string;
  createdAt: string;
  changes?: string[];
  performance?: AgentPerformanceData;
  createdBy?: string;
}
