import { supabase } from '@/lib/supabase';

/**
 * Checks an agent for potential promotion based on votes and performance
 * @param agentVersionId The ID of the agent version to check
 * @returns Object with promotion status and reason
 */
export const checkAgentForPromotion = async (agentVersionId: string) => {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    if (!agent) throw new Error('Agent not found');
    
    // Perform promotion checks based on upvotes/downvotes and XP
    const shouldPromote = agent.upvotes > agent.downvotes && agent.xp > 100;
    
    return {
      shouldPromote,
      reason: shouldPromote 
        ? 'Sufficient upvotes and XP for promotion' 
        : 'Insufficient votes or XP for promotion'
    };
  } catch (err) {
    console.error('Error checking agent for promotion:', err);
    return {
      shouldPromote: false,
      reason: 'Error during promotion check'
    };
  }
};

/**
 * Checks and evolves a single agent based on its performance
 * @param agentVersionId The ID of the agent version to check
 * @returns Object with evolution results
 */
export const checkAndEvolveAgent = async (agentVersionId: string) => {
  try {
    const { shouldPromote, reason } = await checkAgentForPromotion(agentVersionId);
    
    if (!shouldPromote) {
      return { evolved: false, reason };
    }
    
    // Here would be the logic to evolve the agent
    // For now, just return success
    
    return { 
      evolved: true,
      reason: 'Agent successfully evolved'
    };
  } catch (err) {
    console.error('Error evolving agent:', err);
    return {
      evolved: false,
      reason: 'Error during evolution process'
    };
  }
};

/**
 * Checks and evolves multiple agents
 * @param tenantId Optional tenant ID to filter agents
 * @returns Array of evolution results
 */
export const checkAndEvolveAgents = async (tenantId?: string) => {
  try {
    let query = supabase
      .from('agent_versions')
      .select('*');
      
    if (tenantId) {
      // If we had a tenant_id column, we would filter by it
      // This is a placeholder
    }
    
    const { data: agents, error } = await query;
    
    if (error) throw error;
    if (!agents || agents.length === 0) {
      return [];
    }
    
    const results = [];
    
    for (const agent of agents) {
      const result = await checkAndEvolveAgent(agent.id);
      results.push({
        agentId: agent.id,
        ...result
      });
    }
    
    return results;
  } catch (err) {
    console.error('Error checking and evolving agents:', err);
    return [];
  }
};

export default {
  checkAgentForPromotion,
  checkAndEvolveAgent,
  checkAndEvolveAgents
};
