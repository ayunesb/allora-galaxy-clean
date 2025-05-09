
import { supabase } from '@/integrations/supabase/client';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { getAgentUsageStats } from './getAgentUsageStats';
import { calculateAgentPerformance } from './calculatePerformance';
import { getFeedbackComments } from './getFeedbackComments';
import { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface EvolutionConfig {
  evolutionThreshold?: number;
  minimumExecutions?: number;
  failureRateThreshold?: number;
  staleDays?: number;
  batchSize?: number;
}

export interface EvolutionResult {
  success: boolean;
  evolved: number;
  message?: string;
  error?: string;
}

/**
 * Auto-evolves agents based on performance and feedback
 * @param tenantId The tenant ID to evolve agents for
 * @param config Optional configuration parameters
 */
export async function autoEvolveAgents(
  tenantId?: string,
  config?: EvolutionConfig
): Promise<EvolutionResult> {
  try {
    console.log('Starting agent evolution process');
    
    // Evolution configuration
    const evolutionThreshold = config?.evolutionThreshold || 0.7; // Evolution score threshold (0-1)
    const batchSize = config?.batchSize || 10; // Number of agents to process per run

    // Get agents that are candidates for evolution
    const agents = await getAgentsForEvolution(tenantId, batchSize);
    console.log(`Found ${agents.length} agents to check for evolution`);
    
    let evolvedCount = 0;
    
    for (const agent of agents) {
      try {
        // Get usage statistics for this agent
        const stats = await getAgentUsageStats(agent.id);
        
        // Calculate performance score
        const performance = await calculateAgentPerformance(stats);
        console.log(`Agent ${agent.id} performance: ${performance.toFixed(2)}`);
        
        // Check if evolution is needed
        const shouldEvolve = await checkEvolutionNeeded(agent.id, performance, evolutionThreshold);
        
        if (shouldEvolve) {
          console.log(`Evolution needed for agent ${agent.id}`);
          
          // Get feedback comments for this agent
          const feedback = await getFeedbackComments(agent.id);
          
          // Generate evolved prompt based on feedback and performance
          const evolvedPrompt = await evolvePromptWithFeedback(
            agent.prompt,
            feedback,
            performance
          );
          
          if (evolvedPrompt !== agent.prompt) {
            // Create new agent version
            const newAgent = await createEvolvedAgent(
              agent.plugin_id,
              agent.id,
              evolvedPrompt
            );
            
            // Deactivate old agent version
            await deactivateOldAgent(agent.id);
            
            // Log evolution event
            await logSystemEvent(
              'agent',
              'info',
              {
                event: 'agent_evolved',
                old_agent_id: agent.id,
                new_agent_id: newAgent.id,
                plugin_id: agent.plugin_id,
                performance_score: performance,
                feedback_count: feedback.length,
              },
              tenantId
            );
            
            evolvedCount++;
            console.log(`Successfully evolved agent ${agent.id} to new version ${newAgent.id}`);
          } else {
            console.log(`No significant changes in prompt for agent ${agent.id}, skipping evolution`);
          }
        } else {
          console.log(`No evolution needed for agent ${agent.id}`);
        }
      } catch (agentError: any) {
        console.error(`Error evolving agent ${agent.id}:`, agentError);
      }
    }
    
    console.log(`Evolution process complete. Evolved ${evolvedCount} agents.`);
    
    return {
      success: true,
      evolved: evolvedCount,
      message: evolvedCount > 0 
        ? `Successfully evolved ${evolvedCount} agents` 
        : 'No agents needed evolution'
    };
  } catch (err: any) {
    console.error('Error in autoEvolveAgents:', err);
    return {
      success: false,
      evolved: 0,
      error: err.message
    };
  }
}
