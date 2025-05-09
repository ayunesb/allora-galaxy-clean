
/**
 * Calculate the performance score for an agent based on usage statistics
 * @param stats Agent usage statistics
 * @returns Performance score between 0 and 1
 */
export async function calculateAgentPerformance(stats: any[]): Promise<number> {
  // If no stats available, return a neutral score
  if (!stats || stats.length === 0) {
    return 0.5;
  }
  
  // Calculate success rate
  const successCount = stats.filter(stat => stat.status === 'success').length;
  const totalCount = stats.length;
  const successRate = totalCount > 0 ? successCount / totalCount : 0.5;
  
  // Calculate average execution time
  let avgExecutionTime = 0;
  if (stats.some(stat => stat.execution_time)) {
    const totalExecutionTime = stats.reduce((sum, stat) => sum + (stat.execution_time || 0), 0);
    avgExecutionTime = totalCount > 0 ? totalExecutionTime / totalCount : 0;
  }
  
  // Weight factors - success rate is most important
  const weightSuccessRate = 0.7;
  const weightExecutionTime = 0.3;
  
  // Normalize execution time to a 0-1 scale (lower is better)
  // Assume 10 seconds is the upper bound for execution time
  const normalizedExecutionTime = Math.max(0, Math.min(1, 1 - (avgExecutionTime / 10000)));
  
  // Calculate weighted score
  const score = (successRate * weightSuccessRate) + 
                (normalizedExecutionTime * weightExecutionTime);
  
  // Return the final score (0-1 range)
  return score;
}
