
import { supabase } from '@/integrations/supabase/client';

interface EvolutionCheckResult {
  needsEvolution: boolean;
  reason?: string;
  performance?: {
    successRate: number;
    failureRate: number;
    averageExecutionTime: number;
    totalExecutions: number;
  };
}

interface AgentVersionStats {
  success_count: number;
  failure_count: number;
  avg_execution_time: number;
}

/**
 * Checks if an agent version needs evolution based on performance metrics
 * @param agentVersionId Agent version ID to check
 * @param options Additional options
 * @returns Evolution check result
 */
export async function checkEvolutionNeeded(
  agentVersionId: string,
  options?: { 
    minimumExecutions: number; 
    failureRateThreshold: number; 
    staleDays: number; 
  }
): Promise<EvolutionCheckResult> {
  try {
    // Default options
    const minimumExecutions = options?.minimumExecutions || 10;
    const failureRateThreshold = options?.failureRateThreshold || 0.3; // 30%
    const staleDays = options?.staleDays || 30;
    
    // Get agent usage stats
    const { data: stats, error } = await supabase
      .rpc('get_agent_version_stats', { agent_version_id: agentVersionId })
      .single();
    
    if (error) throw error;
    
    // Extract stats or use defaults
    const statsObj = stats as AgentVersionStats || { success_count: 0, failure_count: 0, avg_execution_time: 0 };
    const successCount = statsObj.success_count || 0;
    const failureCount = statsObj.failure_count || 0;
    const totalExecutions = successCount + failureCount;
    
    // Check if there are enough executions to make a decision
    if (totalExecutions < minimumExecutions) {
      return { 
        needsEvolution: false,
        reason: `Not enough executions (${totalExecutions}/${minimumExecutions})`,
        performance: {
          successRate: successCount / (totalExecutions || 1),
          failureRate: failureCount / (totalExecutions || 1),
          averageExecutionTime: statsObj.avg_execution_time || 0,
          totalExecutions
        }
      };
    }
    
    // Check failure rate threshold
    const failureRate = failureCount / totalExecutions;
    if (failureRate > failureRateThreshold) {
      return {
        needsEvolution: true,
        reason: `Failure rate (${(failureRate * 100).toFixed(1)}%) exceeds threshold (${(failureRateThreshold * 100).toFixed(1)}%)`,
        performance: {
          successRate: 1 - failureRate,
          failureRate,
          averageExecutionTime: statsObj.avg_execution_time || 0,
          totalExecutions
        }
      };
    }
    
    // Check if the agent is stale (hasn't been updated in a while)
    const { data: agentVersion } = await supabase
      .from('agent_versions')
      .select('created_at')
      .eq('id', agentVersionId)
      .single();
    
    if (agentVersion) {
      const createdAt = new Date(agentVersion.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation > staleDays) {
        return {
          needsEvolution: true,
          reason: `Agent version is stale (${daysSinceCreation} days old)`,
          performance: {
            successRate: 1 - failureRate,
            failureRate,
            averageExecutionTime: statsObj.avg_execution_time || 0,
            totalExecutions
          }
        };
      }
    }
    
    // If we got here, no evolution is needed yet
    return {
      needsEvolution: false,
      reason: 'Performance within acceptable parameters',
      performance: {
        successRate: 1 - failureRate,
        failureRate,
        averageExecutionTime: statsObj.avg_execution_time || 0,
        totalExecutions
      }
    };
    
  } catch (error: any) {
    console.error(`Error checking if agent ${agentVersionId} needs evolution:`, error);
    return { 
      needsEvolution: false,
      reason: `Error checking evolution status: ${error.message}`
    };
  }
}
