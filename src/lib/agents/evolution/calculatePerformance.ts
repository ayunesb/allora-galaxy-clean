
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate performance metrics for an agent to determine if it needs evolution
 * 
 * @param agentVersionId - ID of the agent version to check
 * @returns Performance metrics and evolution recommendation
 */
export async function calculateAgentPerformance(agentVersionId: string) {
  try {
    // Get agent data
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes, xp')
      .eq('id', agentVersionId)
      .single();
      
    if (agentError || !agent) {
      throw new Error(`Failed to fetch agent data: ${agentError?.message || 'Not found'}`);
    }
    
    // Get execution metrics
    const { data: executions, error: execError } = await supabase
      .from('plugin_logs')
      .select('status, count(*)')
      .eq('agent_version_id', agentVersionId)
      .group('status');
      
    if (execError) {
      console.warn(`Could not fetch execution data: ${execError.message}`);
    }
    
    // Calculate metrics
    const upvotes = agent.upvotes || 0;
    const downvotes = agent.downvotes || 0;
    const totalVotes = upvotes + downvotes;
    const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0.5;
    
    const successCount = executions?.find(e => e.status === 'success')?.count || 0;
    const failureCount = executions?.find(e => e.status === 'failure')?.count || 0;
    const totalExecutions = Number(successCount) + Number(failureCount);
    const successRate = totalExecutions > 0 ? Number(successCount) / totalExecutions : 0;
    
    // Decision logic
    let shouldEvolve = false;
    let evolveReason = null;
    
    // Enough votes and more downvotes than upvotes
    if (totalVotes >= 5 && voteRatio < 0.4) {
      shouldEvolve = true;
      evolveReason = 'Negative user feedback';
    }
    // Many executions with high failure rate
    else if (totalExecutions >= 10 && successRate < 0.7) {
      shouldEvolve = true;
      evolveReason = 'High failure rate';
    }
    // Combination of factors
    else if (totalVotes >= 3 && totalExecutions >= 5 && voteRatio < 0.5 && successRate < 0.8) {
      shouldEvolve = true;
      evolveReason = 'Combined poor metrics';
    }
    
    return {
      shouldEvolve,
      evolveReason,
      metrics: {
        xp: agent.xp || 0,
        upvotes,
        downvotes,
        totalVotes,
        voteRatio,
        totalExecutions,
        successRate
      }
    };
  } catch (error: any) {
    console.error('Error calculating agent performance:', error);
    return {
      shouldEvolve: false,
      evolveReason: null,
      metrics: { xp: 0, upvotes: 0, downvotes: 0 }
    };
  }
}
