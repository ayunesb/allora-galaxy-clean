
import { supabase } from '@/lib/supabase';
import { AgentPerformanceMetrics } from './autoEvolveAgents';

/**
 * Calculate performance metrics for an agent to determine if evolution is needed
 * @param pluginId The ID of the plugin
 * @returns Performance metrics object
 */
export async function calculateAgentPerformance(pluginId: string): Promise<AgentPerformanceMetrics> {
  try {
    // Get the active agent version for this plugin
    const { data: agentData, error: agentError } = await supabase
      .from('agent_versions')
      .select('id')
      .eq('plugin_id', pluginId)
      .eq('status', 'active')
      .single();
    
    if (agentError) throw new Error(`No active agent found for plugin ${pluginId}`);
    
    const agentVersionId = agentData.id;
    
    // Get execution stats
    const { data: executions, error: executionsError } = await supabase
      .from('executions')
      .select('id, status, execution_time, xp_earned')
      .eq('agent_version_id', agentVersionId);
    
    if (executionsError) throw executionsError;
    
    // Get vote stats
    const { data: votes, error: votesError } = await supabase
      .from('agent_votes')
      .select('vote_type')
      .eq('agent_version_id', agentVersionId);
    
    if (votesError) throw votesError;
    
    // Calculate metrics
    const totalExecutions = executions?.length || 0;
    const successfulExecutions = executions?.filter(e => e.status === 'success').length || 0;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    
    const averageExecutionTime = totalExecutions > 0
      ? executions?.reduce((sum, e) => sum + (e.execution_time || 0), 0) / totalExecutions
      : 0;
    
    const xpEarned = executions?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) || 0;
    
    const positiveVotes = votes?.filter(v => v.vote_type === 'up').length || 0;
    const negativeVotes = votes?.filter(v => v.vote_type === 'down').length || 0;
    const neutralVotes = votes?.filter(v => v.vote_type === 'neutral').length || 0;
    
    // Determine if evolution is needed and why
    let needsEvolution = false;
    let evolutionReason: string | undefined;
    
    // Poor success rate or many negative votes indicate need for evolution
    if (totalExecutions >= 10 && successRate < 0.8) {
      needsEvolution = true;
      evolutionReason = `Low success rate (${(successRate * 100).toFixed(1)}%)`;
    } else if (negativeVotes > 5 && negativeVotes > positiveVotes) {
      needsEvolution = true;
      evolutionReason = `Negative feedback (${negativeVotes} downvotes)`;
    } else if (totalExecutions >= 50) {
      // Regular evolution after sufficient volume
      needsEvolution = true;
      evolutionReason = `Regular improvement after ${totalExecutions} executions`;
    }
    
    return {
      needsEvolution,
      evolutionReason,
      positiveVotes,
      negativeVotes,
      neutralVotes,
      totalExecutions,
      successRate,
      averageExecutionTime,
      xpEarned
    };
  } catch (error: any) {
    console.error(`Error calculating agent performance for plugin ${pluginId}:`, error);
    throw error;
  }
}
