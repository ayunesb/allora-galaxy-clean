
import { getAgentUsageStats } from './getAgentUsageStats';
import { getFeedbackComments } from './getFeedbackComments';

/**
 * Check if an agent needs evolution based on performance metrics and feedback
 * @param agentId The ID of the agent version to check
 * @returns Boolean indicating if evolution is needed
 */
export async function checkEvolutionNeeded(agentId: string): Promise<boolean> {
  try {
    const [usageStats, feedback] = await Promise.all([
      getAgentUsageStats(agentId),
      getFeedbackComments(agentId)
    ]);
    
    if (!usageStats.length) {
      // Not enough usage data to make a decision
      return false;
    }
    
    // Check for negative feedback
    const negativeComments = feedback.filter(comment => 
      comment.vote_type === 'downvote'
    );
    
    if (negativeComments.length >= 3) {
      // If there are 3 or more negative feedback comments, evolve the agent
      return true;
    }
    
    // Check for error rate
    const errorRate = usageStats.filter(log => log.status === 'failure').length / usageStats.length;
    if (errorRate >= 0.3 && usageStats.length >= 10) {
      // If error rate is 30%+ with at least 10 executions, evolve the agent
      return true;
    }
    
    // Check for low XP
    const totalXP = usageStats.reduce((sum, log) => sum + (log.xp_earned || 0), 0);
    const avgXP = totalXP / usageStats.length;
    
    if (avgXP < 50 && usageStats.length >= 10) {
      // If average XP is low with sufficient executions, evolve the agent
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if agent needs evolution:', error);
    return false;
  }
}
