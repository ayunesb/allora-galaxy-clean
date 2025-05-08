
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { getFeedbackComments } from './getFeedbackComments';

export interface AutoEvolveConfig {
  minimumExecutions: number;
  failureRateThreshold: number;
  staleDays: number;
  batchSize: number;
}

export interface AutoEvolveResult {
  success: boolean;
  agentsEvolved: number;
  agentsEvaluated: number;
  error?: string;
  evolvedAgentIds?: string[];
}

const DEFAULT_CONFIG: AutoEvolveConfig = {
  minimumExecutions: 10,
  failureRateThreshold: 0.2,
  staleDays: 7,
  batchSize: 5
};

/**
 * Automatically evolve agents based on their performance data and user feedback
 * @param tenantId The tenant ID
 * @param config Configuration options for auto evolution
 * @returns Result of the auto evolution process
 */
export async function autoEvolveAgents(
  tenantId: string,
  config?: Partial<AutoEvolveConfig>
): Promise<AutoEvolveResult> {
  const startTime = performance.now();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Log start of auto evolution process
    await logSystemEvent(
      'agent',
      'info',
      { 
        event: 'auto_evolve_started',
        tenant_id: tenantId,
        config: fullConfig
      },
      tenantId
    );
    
    // Get agents eligible for evolution
    const agents = await getAgentsForEvolution(
      tenantId, 
      fullConfig.minimumExecutions, 
      fullConfig.staleDays, 
      fullConfig.batchSize
    );
    
    console.log(`Found ${agents.length} agents to evaluate for evolution`);
    
    // Track results
    const evolvedAgentIds: string[] = [];
    
    // Process each agent
    for (const agent of agents) {
      try {
        console.log(`Evaluating agent ${agent.id} for evolution`);
        
        // Check if this agent needs evolution based on performance metrics
        const shouldEvolve = await checkEvolutionNeeded(
          agent.id,
          fullConfig.failureRateThreshold
        );
        
        if (!shouldEvolve) {
          console.log(`Agent ${agent.id} does not need evolution`);
          continue;
        }
        
        // Get user feedback for the agent
        const feedback = await getFeedbackComments(agent.id);
        // Note: userFeedback is declared but never read - removing this reference
        
        console.log(`Creating evolved agent for ${agent.id}`);
        
        // Create the new evolved agent version
        const evolutionResult = await createEvolvedAgent(agent.id, tenantId);
        
        if (!evolutionResult.success) {
          console.error(`Failed to evolve agent ${agent.id}: ${evolutionResult.error}`);
          continue;
        }
        
        console.log(`Successfully evolved agent ${agent.id} to new version ${evolutionResult.newAgentId}`);
        
        // Deactivate the old agent version
        await deactivateOldAgent(agent.id);
        
        // Add to results
        evolvedAgentIds.push(evolutionResult.newAgentId);
      } catch (agentError) {
        console.error(`Error processing agent ${agent.id}:`, agentError);
        // Continue with next agent
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;
    
    // Log successful completion
    await logSystemEvent(
      'agent',
      'info',
      { 
        event: 'auto_evolve_completed',
        tenant_id: tenantId,
        agents_evaluated: agents.length,
        agents_evolved: evolvedAgentIds.length,
        evolved_agent_ids: evolvedAgentIds,
        execution_time: executionTime
      },
      tenantId
    );
    
    return {
      success: true,
      agentsEvaluated: agents.length,
      agentsEvolved: evolvedAgentIds.length,
      evolvedAgentIds
    };
  } catch (error: any) {
    console.error('Error in auto evolution process:', error);
    
    // Log failure
    await logSystemEvent(
      'agent', 
      'error',
      {
        event: 'auto_evolve_failed',
        error: error.message || 'Unknown error',
        // Note: tenantId is declared but never read - removing this reference
      },
      tenantId
    );
    
    return {
      success: false,
      error: error.message || 'Unknown error during auto evolution',
      agentsEvaluated: 0,
      agentsEvolved: 0
    };
  }
}
