
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getEmbeddingForText } from '@/lib/utils/embeddings';

/**
 * Get all agents that need evolution based on vote ratios
 */
export async function getAgentsForEvolution(threshold = 0.3) {
  try {
    // Get agents with more downvotes than upvotes by the threshold
    const { data: agentsToEvolve, error } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, prompt, version, upvotes, downvotes')
      .lt('upvotes', supabase.rpc('multiply_value', { value: 'downvotes', multiplier: threshold }))
      .gt('downvotes', 3) // Minimum number of downvotes to consider
      .is('status', 'active')
      .order('downvotes', { ascending: false });
      
    if (error) throw error;
    return agentsToEvolve || [];
  } catch (error) {
    console.error('Error getting agents for evolution:', error);
    return [];
  }
}

/**
 * Count agent usage in recent executions
 */
export async function getAgentUsageStats(days = 30) {
  try {
    const { data: usageStats, error } = await supabase
      .from('plugin_logs')
      .select('agent_version_id, status, count(*)')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .is('status', 'success')
      .groupBy('agent_version_id, status');
      
    if (error) throw error;
    return usageStats || [];
  } catch (error) {
    console.error('Error getting agent usage stats:', error);
    return [];
  }
}

/**
 * Calculate performance score for an agent based on votes and success rate
 */
export function calculateAgentPerformance(
  agentId: string,
  upvotes: number, 
  downvotes: number,
  usageStats: Array<{ agent_version_id: string, status: string, count: number }>
) {
  // Filter usage stats for this agent
  const agentStats = usageStats.filter(stat => stat.agent_version_id === agentId);
  
  // Get success and failure counts
  const successCount = agentStats.find(stat => stat.status === 'success')?.count || 0;
  const failureCount = agentStats.find(stat => stat.status === 'failure')?.count || 0;
  
  const totalCalls = successCount + failureCount;
  const successRate = totalCalls > 0 ? successCount / totalCalls : 0;
  
  // Calculate vote score
  const totalVotes = upvotes + downvotes;
  const voteScore = totalVotes > 0 ? upvotes / totalVotes : 0;
  
  // Combine metrics (weighted)
  return (voteScore * 0.7) + (successRate * 0.3);
}

/**
 * Get the plugin for a specific agent
 */
export async function getPluginForAgent(agentVersionId: string) {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('plugin_id')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    return agent?.plugin_id;
  } catch (error) {
    console.error('Error getting plugin for agent:', error);
    return null;
  }
}

/**
 * Check if agent evolution is needed for a specific agent
 */
export async function checkAgentEvolutionNeeded(
  agentId: string, 
  upvotes: number, 
  downvotes: number,
  threshold = 0.3
) {
  // If no votes yet, no need to evolve
  if (upvotes + downvotes < 3) {
    return false;
  }
  
  const ratio = upvotes / (upvotes + downvotes);
  return ratio < threshold;
}

/**
 * Create a new evolved agent version
 */
export async function createEvolvedAgent(
  pluginId: string, 
  originalPrompt: string, 
  originalVersion: string,
  comments: string[],
  tenantId: string
) {
  try {
    // Generate new version number
    const versionNum = parseInt(originalVersion.replace('v', ''), 10);
    const newVersion = `v${versionNum + 1}`;
    
    // Generate evolved prompt based on comments
    const evolvedPrompt = await evolvePromptWithFeedback(originalPrompt, comments);
    
    // Insert new agent version
    const { data, error } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        prompt: evolvedPrompt,
        version: newVersion,
        status: 'active',
        created_at: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        xp: 0,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the evolution event
    await logSystemEvent(
      tenantId, 
      'agent',
      'agent_evolved',
      { 
        plugin_id: pluginId, 
        agent_id: data.id,
        version: newVersion
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error creating evolved agent:', error);
    throw error;
  }
}

/**
 * Get comment feedback for an agent
 */
export async function getAgentFeedbackComments(agentId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('comment, vote_type')
      .eq('agent_version_id', agentId)
      .not('comment', 'is', null);
      
    if (error) throw error;
    
    // Filter out null/empty comments
    return (data || [])
      .filter(item => item.comment && item.comment.trim() !== '')
      .map(item => `${item.vote_type === 'down' ? 'Issue' : 'Good'}: ${item.comment}`);
  } catch (error) {
    console.error('Error getting agent feedback comments:', error);
    return [];
  }
}

/**
 * Evolve a prompt using feedback
 */
async function evolvePromptWithFeedback(originalPrompt: string, feedback: string[]): Promise<string> {
  // In a real implementation, this would call an LLM to generate an improved prompt
  // For now, just append the feedback to the original prompt
  
  if (feedback.length === 0) {
    return originalPrompt;
  }
  
  const feedbackStr = feedback.join('\n');
  
  // Simplified evolution - in a real system, we would use an LLM for this
  return `${originalPrompt}\n\nFeedback incorporated from previous version:\n${feedbackStr}`;
}

/**
 * Deactivate the old agent version
 */
export async function deactivateOldAgentVersion(agentId: string) {
  try {
    const { error } = await supabase
      .from('agent_versions')
      .update({ status: 'inactive' })
      .eq('id', agentId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating old agent version:', error);
    return false;
  }
}

/**
 * Auto-evolve all agents that need evolution
 */
export async function autoEvolveAgents(tenantId: string) {
  try {
    // Get agents that need evolution
    const agentsToEvolve = await getAgentsForEvolution();
    
    if (agentsToEvolve.length === 0) {
      console.log('No agents need evolution');
      return { evolved: 0, success: true };
    }
    
    // Get usage stats for performance calculation
    const usageStats = await getAgentUsageStats();
    
    // Process each agent
    let evolvedCount = 0;
    
    for (const agent of agentsToEvolve) {
      // Double-check if evolution is needed
      const needsEvolution = await checkAgentEvolutionNeeded(
        agent.id, 
        agent.upvotes || 0, 
        agent.downvotes || 0
      );
      
      if (needsEvolution) {
        // Get feedback comments
        const comments = await getAgentFeedbackComments(agent.id);
        
        // Create evolved version
        await createEvolvedAgent(
          agent.plugin_id,
          agent.prompt,
          agent.version,
          comments,
          tenantId
        );
        
        // Deactivate old version
        await deactivateOldAgentVersion(agent.id);
        
        evolvedCount++;
      }
    }
    
    await logSystemEvent(
      tenantId,
      'system',
      'auto_evolve_completed',
      { evolved_count: evolvedCount, total_checked: agentsToEvolve.length }
    );
    
    return { evolved: evolvedCount, success: true };
  } catch (error) {
    console.error('Error during auto-evolution:', error);
    
    // Log the error
    await logSystemEvent(
      tenantId,
      'system',
      'auto_evolve_error',
      { error: error.message || 'Unknown error' }
    );
    
    return { evolved: 0, success: false, error: error.message };
  }
}

/**
 * Get all plugins that need optimization
 */
export async function getPluginsForOptimization() {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('id')
      .eq('status', 'active');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting plugins for optimization:', error);
    return [];
  }
}
