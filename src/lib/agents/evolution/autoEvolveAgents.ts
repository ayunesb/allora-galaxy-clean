
import { createClient } from '@supabase/supabase-js';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { createEvolvedAgent, EvolutionResult } from './createEvolvedAgent';
import { deactivateAgentVersion } from './deactivateOldAgent';

interface EvolutionConfig {
  minimumExecutions: number;
  failureRateThreshold: number;
  staleDays: number;
  batchSize?: number;
}

interface AutoEvolutionResult {
  success: boolean;
  agentsEvolved: number;
  message?: string;
  error?: string;
}

const DEFAULT_CONFIG: EvolutionConfig = {
  minimumExecutions: 5,
  failureRateThreshold: 0.2,
  staleDays: 30,
  batchSize: 10
};

/**
 * Automatically evolve agents that need improvement based on performance metrics
 * @param tenantId The tenant ID to run auto-evolution for
 * @param config Optional configuration parameters
 */
export async function autoEvolveAgents(
  tenantId: string,
  config: EvolutionConfig = DEFAULT_CONFIG
): Promise<AutoEvolutionResult> {
  try {
    // Get the Supabase client (we can't import directly due to edge function context)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get agents that might need evolution (poor performance or stale)
    const { data: agents, error } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('status', 'active')
      .limit(config.batchSize || 10);
    
    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
    
    if (!agents || agents.length === 0) {
      return {
        success: true,
        agentsEvolved: 0,
        message: 'No agents needed evolution'
      };
    }
    
    // Log the start of auto-evolution
    await logSystemEvent('agent', 'info', {
      event: 'auto_evolve_started',
      tenant_id: tenantId,
      agents_count: agents.length
    });
    
    let evolvedCount = 0;
    
    // Process each agent
    for (const agent of agents) {
      try {
        // Check if agent needs evolution based on performance
        const needsEvolution = await shouldEvolveAgent(supabase, agent, config);
        
        if (needsEvolution) {
          // Get feedback for the agent
          const feedback = await getFeedbackForAgent(supabase, agent.id);
          
          // Create evolved agent
          const result = await createEvolvedAgent({
            parentAgentVersionId: agent.id,
            tenantId,
            userId: 'system', // Auto-evolution is done by the system
            prompt: agent.prompt // We'll modify this in the future based on feedback
          });
          
          if (result.success && result.agentVersionId) {
            // Deactivate the old agent
            await deactivateAgentVersion(agent.id, result.agentVersionId);
            evolvedCount++;
            
            // Log the successful evolution
            await logSystemEvent('agent', 'info', {
              event: 'agent_evolved',
              old_agent_id: agent.id,
              new_agent_id: result.agentVersionId,
              auto_evolved: true
            });
          }
        }
      } catch (agentError: any) {
        console.error(`Error processing agent ${agent.id}:`, agentError);
      }
    }
    
    // Log completion
    await logSystemEvent('agent', 'info', {
      event: 'auto_evolve_completed',
      tenant_id: tenantId,
      agents_evolved: evolvedCount,
      total_agents: agents.length
    });
    
    return {
      success: true,
      agentsEvolved: evolvedCount,
      message: `Successfully evolved ${evolvedCount} out of ${agents.length} agents`
    };
  } catch (error: any) {
    console.error('Error in autoEvolveAgents:', error);
    
    // Log error
    await logSystemEvent('agent', 'error', {
      event: 'auto_evolve_failed',
      error: error.message
    }, tenantId);
    
    return {
      success: false,
      agentsEvolved: 0,
      error: error.message
    };
  }
}

/**
 * Check if an agent should be evolved based on performance metrics
 */
async function shouldEvolveAgent(
  supabase: any,
  agent: any,
  config: EvolutionConfig
): Promise<boolean> {
  // This is a placeholder for actual implementation
  // In a real implementation, we would check:
  // 1. Poor performance (high failure rate)
  // 2. Staleness (no updates in X days)
  // 3. Low XP gain
  // 4. High downvote ratio
  
  return true; // For testing purposes, return true
}

/**
 * Get feedback for an agent to inform evolution
 */
async function getFeedbackForAgent(
  supabase: any,
  agentId: string
): Promise<any[]> {
  // Get votes with comments
  const { data, error } = await supabase
    .from('agent_votes')
    .select('*')
    .eq('agent_version_id', agentId)
    .not('comment', 'is', null);
    
  if (error) {
    console.error(`Error fetching feedback for agent ${agentId}:`, error);
    return [];
  }
  
  return data || [];
}
