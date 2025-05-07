
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Type definition for agent evolution result
export interface AgentEvolutionResult {
  evolved: boolean;
  reason: string;
  agentId?: string;
  newAgentId?: string;
  version?: string;
  newVersion?: string;
}

// Type definition for multiple agent evolution results
export interface AgentEvolutionBatchResult {
  evolvedCount: number;
  results: AgentEvolutionResult[];
  errors?: string[];
}

/**
 * Checks an agent for potential promotion based on votes and performance
 * @param agentVersionId The ID of the agent version to check
 * @returns Object with promotion status and reason
 */
export const checkAgentForPromotion = async (agentVersionId: string) => {
  try {
    // Fetch agent version with its votes and execution metrics
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    if (!agent) throw new Error('Agent not found');
    
    // Get execution stats from plugin logs
    const { data: executionStats, error: execError } = await supabase
      .from('plugin_logs')
      .select('status, count')
      .eq('agent_version_id', agentVersionId)
      .group('status')
      .count();
    
    if (execError) {
      console.warn(`Could not fetch execution stats: ${execError.message}`);
    }
    
    // Calculate success rate
    const successCount = executionStats?.find(stat => stat.status === 'success')?.count || 0;
    const failureCount = executionStats?.find(stat => stat.status === 'failure')?.count || 0;
    const totalExecutions = successCount + failureCount;
    const successRate = totalExecutions > 0 ? successCount / totalExecutions : 0;
    
    // Decision criteria
    const hasEnoughVotes = (agent.upvotes + agent.downvotes) >= 10;
    const hasPositiveVoteRatio = agent.upvotes > agent.downvotes;
    const hasEnoughXP = agent.xp > 100;
    const hasGoodSuccessRate = successRate >= 0.7;
    const hasEnoughExecutions = totalExecutions > 5;
    
    const shouldPromote = 
      hasEnoughVotes && 
      hasPositiveVoteRatio && 
      hasEnoughXP && 
      (hasGoodSuccessRate || !hasEnoughExecutions);
    
    let reason = shouldPromote 
      ? 'Agent meets promotion criteria' 
      : 'Agent does not meet promotion criteria';
      
    // Add specific reasons for not promoting
    if (!shouldPromote) {
      if (!hasEnoughVotes) reason += ': insufficient votes';
      else if (!hasPositiveVoteRatio) reason += ': negative vote ratio';
      else if (!hasEnoughXP) reason += ': insufficient XP';
      else if (!hasGoodSuccessRate && hasEnoughExecutions) reason += ': poor success rate';
    }
    
    return {
      shouldPromote,
      reason,
      metrics: {
        votes: { up: agent.upvotes, down: agent.downvotes, total: agent.upvotes + agent.downvotes },
        executions: { success: successCount, failure: failureCount, total: totalExecutions, rate: successRate },
        xp: agent.xp
      }
    };
  } catch (err) {
    console.error('Error checking agent for promotion:', err);
    return {
      shouldPromote: false,
      reason: `Error during promotion check: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
};

/**
 * Checks and evolves a single agent based on its performance
 * @param agentVersionId The ID of the agent version to check
 * @param tenantId The tenant ID for logging
 * @returns Object with evolution results
 */
export const checkAndEvolveAgent = async (
  agentVersionId: string, 
  tenantId: string
): Promise<AgentEvolutionResult> => {
  try {
    const { shouldPromote, reason, metrics } = await checkAgentForPromotion(agentVersionId);
    
    if (!shouldPromote) {
      return { 
        evolved: false, 
        reason, 
        agentId: agentVersionId 
      };
    }
    
    // Get current agent version details
    const { data: currentAgent, error: agentError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();
      
    if (agentError || !currentAgent) {
      throw new Error(`Failed to fetch agent version: ${agentError?.message || 'Not found'}`);
    }
    
    // Prepare new version string
    const currentVersion = currentAgent.version || '1.0.0';
    const versionParts = currentVersion.split('.');
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2] || '0') + 1}`;
    
    // Get feedback from votes
    const { data: votes, error: votesError } = await supabase
      .from('agent_votes')
      .select('comment, vote_type')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (votesError) {
      console.warn(`Could not fetch agent votes: ${votesError.message}`);
    }
    
    // Generate improved prompt based on feedback
    const positiveComments = votes?.filter(v => v.vote_type === 'up').map(v => v.comment).join('\n') || '';
    const negativeComments = votes?.filter(v => v.vote_type === 'down').map(v => v.comment).join('\n') || '';
    
    const improvedPrompt = `${currentAgent.prompt}\n\n/* Auto-evolved from version ${currentVersion} to ${newVersion} */\n\n` +
      (positiveComments ? `Positive feedback:\n${positiveComments}\n\n` : '') +
      (negativeComments ? `Areas for improvement:\n${negativeComments}\n\n` : '') +
      `This is an automatically evolved version of the agent based on user feedback and performance metrics.`;
    
    // Insert new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: currentAgent.plugin_id,
        version: newVersion,
        prompt: improvedPrompt,
        status: 'active',
        created_by: null, // Auto-evolved
        xp: 0,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();
      
    if (insertError || !newAgent) {
      throw new Error(`Failed to create new agent version: ${insertError?.message || 'Unknown error'}`);
    }
    
    // Update status of the old version
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ status: 'deprecated' })
      .eq('id', agentVersionId);
      
    if (updateError) {
      console.warn(`Failed to update old agent version status: ${updateError.message}`);
    }
    
    // Log the evolution event
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_auto_evolved',
      {
        old_agent_id: agentVersionId,
        new_agent_id: newAgent.id,
        plugin_id: currentAgent.plugin_id,
        old_version: currentVersion,
        new_version: newVersion,
        metrics
      }
    ).catch(err => {
      console.warn('Failed to log agent evolution:', err);
    });
    
    return {
      evolved: true,
      reason: `Agent successfully evolved to version ${newVersion}`,
      agentId: agentVersionId,
      newAgentId: newAgent.id,
      version: currentVersion,
      newVersion
    };
  } catch (err) {
    console.error('Error evolving agent:', err);
    return {
      evolved: false,
      reason: `Error during evolution process: ${err instanceof Error ? err.message : 'Unknown error'}`,
      agentId: agentVersionId
    };
  }
};

/**
 * Checks and evolves multiple agents
 * @param tenantId Optional tenant ID to filter agents
 * @returns Array of evolution results
 */
export const checkAndEvolveAgents = async (tenantId?: string): Promise<AgentEvolutionBatchResult> => {
  try {
    let query = supabase
      .from('agent_versions')
      .select('id, plugin_id, version, tenant_id')
      .eq('status', 'active');
      
    if (tenantId) {
      // Filter by tenant_id if provided using a subquery to find plugins for this tenant
      query = query.in('plugin_id', 
        supabase.from('plugins')
          .select('id')
          .eq('tenant_id', tenantId)
      );
    }
    
    const { data: agents, error } = await query;
    
    if (error) throw error;
    if (!agents || agents.length === 0) {
      return { 
        evolvedCount: 0, 
        results: [] 
      };
    }
    
    const results: AgentEvolutionResult[] = [];
    let evolvedCount = 0;
    const errors: string[] = [];
    
    for (const agent of agents) {
      try {
        // Use the tenant_id from the agent's plugin if available
        const agentTenantId = tenantId || 'system';
        
        const result = await checkAndEvolveAgent(agent.id, agentTenantId);
        if (result.evolved) {
          evolvedCount++;
        }
        results.push(result);
      } catch (agentError: any) {
        const errorMessage = `Error processing agent ${agent.id}: ${agentError.message}`;
        errors.push(errorMessage);
        console.error(errorMessage);
        
        results.push({
          evolved: false,
          reason: errorMessage,
          agentId: agent.id,
          version: agent.version
        });
      }
    }
    
    return {
      evolvedCount,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (err) {
    console.error('Error checking and evolving agents:', err);
    return { 
      evolvedCount: 0, 
      results: [],
      errors: [`Global error: ${err instanceof Error ? err.message : 'Unknown error'}`]
    };
  }
};

export default {
  checkAgentForPromotion,
  checkAndEvolveAgent,
  checkAndEvolveAgents
};
