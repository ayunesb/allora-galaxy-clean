
/**
 * Calculate performance score for an agent based on usage statistics
 * @param stats Array of usage logs
 * @returns Performance score between 0 and 1
 */
export function calculatePerformance(stats: any[]): number {
  if (!stats || stats.length === 0) return 0.5; // Default neutral score
  
  const successCount = stats.filter(log => log.status === 'success').length;
  const totalCount = stats.length;
  
  // Calculate base success rate
  const successRate = totalCount > 0 ? successCount / totalCount : 0.5;
  
  // Calculate average XP earned (normalized to 0-1 scale)
  const totalXp = stats.reduce((sum, log) => sum + (log.xp_earned || 0), 0);
  const averageXp = totalCount > 0 ? totalXp / (totalCount * 20) : 0; // Normalize to 0-1 assuming max XP is 20
  
  // Calculate execution time factor (faster is better, normalized to 0-1 scale)
  const successLogs = stats.filter(log => log.status === 'success');
  let timeScore = 0.5;
  if (successLogs.length > 0) {
    const avgExecutionTime = successLogs.reduce((sum, log) => sum + (log.execution_time || 0), 0) / successLogs.length;
    // Lower time is better, with diminishing returns after 5 seconds
    timeScore = Math.max(0, Math.min(1, 1 - (avgExecutionTime / 10)));
  }
  
  // Combine scores with different weights
  return (successRate * 0.6) + (averageXp * 0.2) + (timeScore * 0.2);
}
