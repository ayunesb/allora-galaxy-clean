
import { supabase } from '@/lib/supabase';
import { AgentPerformanceMetrics } from './autoEvolveAgents';

/**
 * Calculate performance metrics for an agent to determine if evolution is needed
 * @param pluginId The ID of the plugin
 * @returns Performance metrics object
 */
export async function calculateAgentPerformance(feedbackData: any[], usageStats: any[]): Promise<number> {
  try {
    // Calculate a performance score based on feedback and usage
    // This is a simplified implementation - in production this would be more sophisticated
    
    // Calculate positive/negative vote ratio
    const positiveVotes = feedbackData.filter(f => f.vote_type === 'up').length;
    const negativeVotes = feedbackData.filter(f => f.vote_type === 'down').length;
    const totalVotes = positiveVotes + negativeVotes;
    
    // Calculate success rate from usage stats
    const totalUsage = usageStats.reduce((sum, s) => sum + (s.count || 0), 0);
    const successfulUsage = usageStats
      .filter(s => s.status === 'success')
      .reduce((sum, s) => sum + (s.count || 0), 0);
    
    // Calculate performance score (0-1)
    let performanceScore = 0.5; // Default middle score
    
    if (totalVotes > 0) {
      const voteScore = positiveVotes / totalVotes;
      performanceScore = voteScore * 0.7; // 70% weight to votes
    }
    
    if (totalUsage > 0) {
      const usageScore = successfulUsage / totalUsage;
      // Blend with usage score (30% weight to usage)
      performanceScore = (performanceScore * 0.7) + (usageScore * 0.3);
    }
    
    return performanceScore;
  } catch (error) {
    console.error('Error calculating agent performance:', error);
    return 0.5; // Return default middle score on error
  }
}
