
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';

export interface AgentEvolutionResult {
  agentId: string;
  success: boolean;
  newAgentId?: string;
  newVersion?: string;
  error?: string;
  reason?: string;
}

export interface EvolutionResult {
  evolved: number;
  results: AgentEvolutionResult[];
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Auto evolve agents based on performance metrics and feedback
 * @param agents Array of agent versions to evaluate for evolution
 * @param tenantId The tenant ID
 * @returns Results of the evolution process
 */
export async function autoEvolveAgents(
  agents: { id: string; version: string; prompt: string }[],
  tenantId: string
): Promise<EvolutionResult> {
  const results: AgentEvolutionResult[] = [];
  let evolvedCount = 0;
  let success = true;
  let message = '';
  
  try {
    for (const agent of agents) {
      try {
        // Check if this agent needs evolution
        const needsEvolution = await checkEvolutionNeeded(agent.id);
        
        if (!needsEvolution) {
          results.push({
            agentId: agent.id,
            success: false,
            reason: 'No evolution needed based on current metrics'
          });
          continue;
        }
        
        // Create evolved agent version
        const evolved = await createEvolvedAgent(agent.id, tenantId);
        
        if (evolved && evolved.success) {
          // Deactivate the old agent
          await deactivateOldAgent(agent.id);
          
          results.push({
            agentId: agent.id,
            success: true,
            newAgentId: evolved.id,
            newVersion: evolved.version
          });
          
          evolvedCount++;
        } else {
          results.push({
            agentId: agent.id,
            success: false,
            reason: 'Failed to create evolved agent'
          });
        }
      } catch (error: any) {
        results.push({
          agentId: agent.id,
          success: false,
          error: `Error during evolution: ${error.message}`
        });
      }
    }
    
    // Set appropriate message based on evolution results
    if (evolvedCount > 0) {
      message = `Successfully evolved ${evolvedCount} agents`;
    } else {
      message = 'No agents needed evolution';
    }
    
    return {
      evolved: evolvedCount,
      results,
      success,
      message
    };
    
  } catch (error: any) {
    return {
      evolved: evolvedCount,
      results,
      success: false,
      error: error.message,
      message: 'Error in autoEvolveAgents function'
    };
  }
}
