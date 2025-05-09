
/**
 * Calculates the performance score of an agent based on its usage statistics
 * @param stats Array of usage statistics for the agent
 * @returns Performance score between 0 and 1
 */
export async function calculateAgentPerformance(stats: any[]): Promise<number> {
  try {
    if (!stats || stats.length === 0) {
      return 0.5; // Default to neutral score if no stats
    }
    
    // Extract success count and total count
    const totalCount = stats.length;
    const successCount = stats.filter(stat => stat.status === 'success').length;
    
    // Calculate base success rate
    const successRate = successCount / totalCount;
    
    // Calculate average execution time (lower is better)
    const executionTimes = stats
      .filter(stat => typeof stat.execution_time === 'number' && stat.execution_time > 0)
      .map(stat => stat.execution_time);
      
    let timeEfficiency = 0.5; // Default neutral score
    
    if (executionTimes.length > 0) {
      const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      // Normalize to a score where 0.1s is excellent (1.0) and 10s is poor (0.0)
      // Using a logarithmic scale
      timeEfficiency = Math.max(0, Math.min(1, 1 - (Math.log(avgExecutionTime + 0.1) / Math.log(20))));
    }
    
    // Weighted score combining success rate (70%) and time efficiency (30%)
    const performanceScore = (successRate * 0.7) + (timeEfficiency * 0.3);
    
    return performanceScore;
  } catch (err) {
    console.error('Error calculating agent performance:', err);
    return 0.5; // Default to neutral score on error
  }
}
