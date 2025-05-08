
import { getAgentUsageStats } from './getAgentUsageStats';
import { getAgentVoteStats } from '../voting/getAgentVoteStats';

export interface AgentPerformanceMetrics {
  id: string;
  usageCount: number;
  failureRate: number;
  downvoteRate: number;
  averageExecutionTime: number;
  lastEvolution: Date | null;
  daysSinceLastEvolution: number;
  score: number;
}

/**
 * Check if an agent needs evolution based on performance metrics
 * 
 * @param agentId The agent version ID to check
 * @param tenantId The tenant ID
 * @returns Boolean indicating if evolution is needed
 */
export async function checkEvolutionNeeded(
  agentId: string,
  tenantId: string
): Promise<boolean> {
  try {
    // Get usage statistics
    const usageStats = await getAgentUsageStats(agentId);
    
    // Get voting statistics
    const voteStats = await getAgentVoteStats(agentId);
    
    // Define thresholds for evolution
    const FAILURE_RATE_THRESHOLD = 0.1; // 10% failures
    const DOWNVOTE_RATE_THRESHOLD = 0.15; // 15% downvotes
    const MIN_USAGE_COUNT = 10; // Require at least 10 executions
    const MIN_DAYS_SINCE_EVOLUTION = 7; // At least a week since last evolution
    
    // Calculate metrics
    const failureRate = usageStats.failureCount / usageStats.totalExecutions;
    const downvoteRate = voteStats.downvotes / (voteStats.upvotes + voteStats.downvotes);
    
    // Get last evolution date
    const { data: versionData } = await supabase
      .from('agent_versions')
      .select('created_at, previous_version_id')
      .eq('id', agentId)
      .single();
      
    let daysSinceLastEvolution = 30; // Default to 30 days if no previous version
    
    if (versionData?.created_at) {
      const createdDate = new Date(versionData.created_at);
      const daysElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      daysSinceLastEvolution = Math.floor(daysElapsed);
    }
    
    // Only evolve if:
    // 1. Has enough usage
    // 2. Has high failure rate OR high downvote rate
    // 3. Has been at least MIN_DAYS_SINCE_EVOLUTION since last evolution
    return usageStats.totalExecutions >= MIN_USAGE_COUNT &&
           (failureRate >= FAILURE_RATE_THRESHOLD || downvoteRate >= DOWNVOTE_RATE_THRESHOLD) &&
           daysSinceLastEvolution >= MIN_DAYS_SINCE_EVOLUTION;
  } catch (err) {
    console.error('Error checking if agent needs evolution:', err);
    return false;
  }
}

// Importing supabase at the top would cause a circular dependency in some environments
const { supabase } = require('@/integrations/supabase/client');
