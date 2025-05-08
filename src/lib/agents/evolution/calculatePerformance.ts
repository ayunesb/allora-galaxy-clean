
import { LogStatus } from '@/types/shared';

interface UsageStat {
  agent_version_id: string;
  status: LogStatus;
  count: number;
}

/**
 * Calculate agent performance based on votes and execution stats
 * @param agentId Agent version ID
 * @param upvotes Number of upvotes
 * @param downvotes Number of downvotes
 * @param usageStats Execution statistics
 */
export function calculateAgentPerformance(
  agentId: string,
  upvotes: number,
  downvotes: number,
  usageStats: UsageStat[]
): number {
  // Calculate vote score (70% of overall score)
  const totalVotes = upvotes + downvotes;
  const voteScore = totalVotes > 0 ? (upvotes / totalVotes) : 0.5;
  
  // Calculate execution score (30% of overall score)
  const agentStats = usageStats.filter(stat => stat.agent_version_id === agentId);
  const successStats = agentStats.find(stat => stat.status === 'success');
  const failureStats = agentStats.find(stat => stat.status === 'failure');
  
  const successCount = successStats?.count || 0;
  const failureCount = failureStats?.count || 0;
  const totalExecutions = successCount + failureCount;
  
  const executionScore = totalExecutions > 0 ? (successCount / totalExecutions) : 0;
  
  // Weighted combined score
  return voteScore * 0.7 + executionScore * 0.3;
}
