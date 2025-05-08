
import { supabase } from '@/integrations/supabase/client';

interface AgentPerformanceMetrics {
  xp: number;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  voteRatio: number;
  totalExecutions: number;
  successRate: number;
}

/**
 * Calculate the performance metrics for an agent version
 * 
 * @param agentVersionId - ID of the agent version
 * @returns Performance metrics
 */
export async function calculateAgentPerformance(agentVersionId: string): Promise<AgentPerformanceMetrics> {
  try {
    // Get vote statistics
    const voteStatsQuery = await supabase
      .from('agent_votes')
      .select('vote_type, count')
      .eq('agent_version_id', agentVersionId)
      .then(response => {
        const { data, error } = response;
        return { data, error };
      });

    // Get execution statistics
    const executionStatsQuery = await supabase
      .from('plugin_logs')
      .select('status, count')
      .eq('agent_version_id', agentVersionId)
      .is('deleted_at', null)
      .then(response => {
        const { data, error } = response;
        return { data, error };
      });

    // Get XP earned
    const xpQuery = await supabase
      .from('plugin_logs')
      .select('xp_earned')
      .eq('agent_version_id', agentVersionId)
      .is('deleted_at', null)
      .then(response => {
        const { data, error } = response;
        return { data, error };
      });

    // Calculate metrics
    const upvotes = voteStatsQuery.data?.find((e: { vote_type: string }) => e.vote_type === 'up')?.count || 0;
    const downvotes = voteStatsQuery.data?.find((e: { vote_type: string }) => e.vote_type === 'down')?.count || 0;
    const totalVotes = upvotes + downvotes;
    const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0.5; // Default to neutral if no votes
    
    const successCount = executionStatsQuery.data?.find((e: { status: string }) => e.status === 'success')?.count || 0;
    const failureCount = executionStatsQuery.data?.find((e: { status: string }) => e.status === 'failure')?.count || 0;
    const totalExecutions = successCount + failureCount;
    const successRate = totalExecutions > 0 ? successCount / totalExecutions : 0;
    
    const totalXp = xpQuery.data?.reduce((sum: number, record: { xp_earned: number }) => 
      sum + (record.xp_earned || 0), 0) || 0;

    return {
      xp: totalXp,
      upvotes,
      downvotes,
      totalVotes,
      voteRatio,
      totalExecutions,
      successRate
    };
  } catch (error) {
    console.error('Error calculating agent performance:', error);
    return {
      xp: 0,
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      voteRatio: 0.5,
      totalExecutions: 0,
      successRate: 0
    };
  }
}
