
import { supabase } from '@/lib/supabase';

/**
 * Calculate the performance metrics for an agent version
 * @param agentId The agent version ID
 * @returns Performance metrics object
 */
export async function calculateAgentPerformance(agentId: string): Promise<any> {
  try {
    // Get execution logs for this agent
    const { data: logs, error } = await supabase
      .from('execution_logs')
      .select('status, execution_time, xp_earned')
      .eq('agent_version_id', agentId);
      
    if (error) {
      console.error('Error fetching execution logs:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Calculate metrics
    const totalExecutions = logs?.length || 0;
    const successfulExecutions = logs?.filter(log => log.status === 'success')?.length || 0;
    const failedExecutions = logs?.filter(log => log.status === 'error')?.length || 0;
    const totalExecutionTime = logs?.reduce((sum, log) => sum + (log.execution_time || 0), 0) || 0;
    const totalXpEarned = logs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0;
    
    // Get vote data
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentId)
      .single();
      
    if (agentError) {
      console.error('Error fetching agent votes:', agentError);
    }
    
    const upvotes = agent?.upvotes || 0;
    const downvotes = agent?.downvotes || 0;
    const totalVotes = upvotes + downvotes;
    const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
    
    // Return performance data
    return {
      success: true,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      averageExecutionTime: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
      totalXpEarned,
      upvotes,
      downvotes,
      voteRatio
    };
  } catch (err: any) {
    console.error('Error calculating agent performance:', err);
    return {
      success: false,
      error: err.message
    };
  }
}
