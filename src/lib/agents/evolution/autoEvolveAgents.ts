
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Get plugins that need optimization based on usage patterns
 */
async function getPluginsForOptimization(tenantId: string) {
  const { data: plugins, error } = await supabase
    .from('plugins')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('usage_count', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('Error getting plugins for optimization:', error);
    return [];
  }
  
  return plugins || [];
}

/**
 * Check if evolution is needed for an agent
 */
async function checkEvolutionNeeded(agentVersionId: string) {
  // Get votes and performance metrics
  const { data: votes, error: votesError } = await supabase
    .from('agent_votes')
    .select('vote_type')
    .eq('agent_version_id', agentVersionId);
    
  if (votesError) {
    console.error('Error checking agent votes:', votesError);
    return false;
  }
  
  // Simple algorithm: if more than 50% downvotes, evolution is needed
  if (votes && votes.length > 0) {
    const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
    const downvotePercentage = (downvotes / votes.length) * 100;
    
    if (downvotePercentage > 50) {
      return true;
    }
  }
  
  // Check execution success rate (simplified)
  const { data: logs, error: logsError } = await supabase
    .from('plugin_logs')
    .select('status')
    .eq('agent_version_id', agentVersionId)
    .limit(100);
    
  if (logsError) {
    console.error('Error checking agent logs:', logsError);
    return false;
  }
  
  if (logs && logs.length > 10) {
    const failures = logs.filter(l => l.status === 'failure').length;
    const failureRate = (failures / logs.length) * 100;
    
    if (failureRate > 30) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get agent versions that need evolution
 */
async function getAgentsForEvolution(tenantId: string) {
  const { data: agentVersions, error } = await supabase
    .from('agent_versions')
    .select('id, version, plugin_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');
    
  if (error) {
    console.error('Error getting agent versions:', error);
    return [];
  }
  
  const agentsNeedingEvolution = [];
  
  for (const agent of agentVersions || []) {
    const needsEvolution = await checkEvolutionNeeded(agent.id);
    if (needsEvolution) {
      agentsNeedingEvolution.push(agent);
    }
  }
  
  return agentsNeedingEvolution;
}

/**
 * Evolve agent prompts based on feedback
 */
async function evolvePromptWithFeedback(agentVersionId: string) {
  // Get the current agent version
  const { data: agentVersion, error: agentError } = await supabase
    .from('agent_versions')
    .select('*')
    .eq('id', agentVersionId)
    .single();
    
  if (agentError || !agentVersion) {
    console.error('Error getting agent version:', agentError);
    return null;
  }
  
  // Get feedback comments
  const { data: comments, error: commentsError } = await supabase
    .from('agent_votes')
    .select('comment, vote_type')
    .eq('agent_version_id', agentVersionId)
    .not('comment', 'is', null);
    
  if (commentsError) {
    console.error('Error getting feedback comments:', commentsError);
    return null;
  }
  
  // Simple evolution simulation (in a real app, use AI to generate the new prompt)
  const currentPrompt = agentVersion.prompt;
  const newPromptVersion = incrementVersion(agentVersion.version);
  
  // Create evolved prompt (simplified)
  const improvedPrompt = `${currentPrompt}\n\n/* Evolved version ${newPromptVersion} with the following improvements:\n`;
    
  return {
    prompt: improvedPrompt,
    version: newPromptVersion,
    basedOn: agentVersionId
  };
}

/**
 * Increment version number (e.g., 1.0.0 -> 1.0.1)
 */
function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

/**
 * Create new evolved agent version
 */
async function createEvolvedAgent(tenantId: string, pluginId: string, evolution: any) {
  const { data, error } = await supabase
    .from('agent_versions')
    .insert({
      tenant_id: tenantId,
      plugin_id: pluginId,
      prompt: evolution.prompt,
      version: evolution.version,
      status: 'pending_approval', // New versions start in pending_approval state
      based_on_id: evolution.basedOn,
      created_by: 'system', // System-generated evolution
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating evolved agent:', error);
    return null;
  }
  
  return data;
}

/**
 * Auto-evolve agents based on feedback and performance
 */
export async function autoEvolveAgents(tenantId: string) {
  try {
    const evolvedAgents = [];
    const errors = [];
    
    // Get plugins that need optimization
    const plugins = await getPluginsForOptimization(tenantId);
    
    // Get agents that need evolution
    const agents = await getAgentsForEvolution(tenantId);
    
    // Process each agent that needs evolution
    for (const agent of agents) {
      try {
        // Create evolved version
        const evolution = await evolvePromptWithFeedback(agent.id);
        
        if (evolution) {
          // Create new agent version
          const newAgent = await createEvolvedAgent(tenantId, agent.plugin_id, evolution);
          
          if (newAgent) {
            evolvedAgents.push(newAgent);
            
            // Log the evolution event
            await logSystemEvent(
              'agent', 
              'info', 
              {
                action: 'auto_evolved',
                agent_id: agent.id,
                new_agent_id: newAgent.id,
                version: evolution.version
              }, 
              tenantId
            );
          }
        }
      } catch (agentError: any) {
        errors.push(agentError.message);
        console.error(`Error evolving agent ${agent.id}:`, agentError);
      }
    }
    
    return {
      success: true,
      evolvedAgents: evolvedAgents.length,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error: any) {
    console.error('Error in autoEvolveAgents:', error);
    return { 
      success: false, 
      evolvedAgents: 0, 
      errors: [error.message] 
    };
  }
}
