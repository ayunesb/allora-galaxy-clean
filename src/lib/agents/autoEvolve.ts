
import { supabase } from '@/lib/supabase';

// Type definition for agent evolution result
export interface AgentEvolutionResult {
  evolved: boolean;
  reason: string;
  agentId?: string;
}

// Type definition for multiple agent evolution results
export interface AgentEvolutionBatchResult {
  evolvedCount: number;
  results: AgentEvolutionResult[];
}

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
export const checkAndEvolveAgent = async (agentVersionId: string): Promise<AgentEvolutionResult> => {
  try {
    const { shouldPromote, reason } = await checkAgentForPromotion(agentVersionId);
    
    if (!shouldPromote) {
      return { evolved: false, reason, agentId: agentVersionId };
    }
    
    // Here would be the logic to evolve the agent
    // For now, just return success
    
    return { 
      evolved: true,
      reason: 'Agent successfully evolved',
      agentId: agentVersionId
    };
  } catch (err) {
    console.error('Error evolving agent:', err);
    return {
      evolved: false,
      reason: 'Error during evolution process',
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
      .select('*');
      
    if (tenantId) {
      // Filter by tenant_id if provided
      query = query.eq('tenant_id', tenantId);
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
    
    for (const agent of agents) {
      const result = await checkAndEvolveAgent(agent.id);
      if (result.evolved) {
        evolvedCount++;
      }
      results.push(result);
    }
    
    return {
      evolvedCount,
      results
    };
  } catch (err) {
    console.error('Error checking and evolving agents:', err);
    return { 
      evolvedCount: 0, 
      results: [] 
    };
  }
};

export default {
  checkAgentForPromotion,
  checkAndEvolveAgent,
  checkAndEvolveAgents
};
