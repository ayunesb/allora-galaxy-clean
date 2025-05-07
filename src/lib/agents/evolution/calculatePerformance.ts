
/**
 * Calculate performance score for an agent based on votes and success rate
 */
export function calculateAgentPerformance(
  agentId: string,
  upvotes: number, 
  downvotes: number,
  usageStats: Array<{ agent_version_id: string, status: string, count: number }>
) {
  // Filter usage stats for this agent
  const agentStats = usageStats.filter(stat => stat.agent_version_id === agentId);
  
  // Get success and failure counts
  const successCount = agentStats.find(stat => stat.status === 'success')?.count || 0;
  const failureCount = agentStats.find(stat => stat.status === 'failure')?.count || 0;
  
  const totalCalls = successCount + failureCount;
  const successRate = totalCalls > 0 ? successCount / totalCalls : 0;
  
  // Calculate vote score
  const totalVotes = upvotes + downvotes;
  const voteScore = totalVotes > 0 ? upvotes / totalVotes : 0;
  
  // Combine metrics (weighted)
  return (voteScore * 0.7) + (successRate * 0.3);
}
