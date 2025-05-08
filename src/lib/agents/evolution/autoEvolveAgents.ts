
import { supabase } from '@/integrations/supabase/client';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { getAgentUsageStats } from './getAgentUsageStats';
import { calculatePerformance } from './calculatePerformance';
import { getFeedbackComments } from './getFeedbackComments';
import { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Auto-evolves agents based on performance and feedback
 * @param tenantId The tenant ID to evolve agents for
 */
export async function autoEvolveAgents(tenantId?: string): Promise<{
  success: boolean;
  evolved: number;
  error?: string;
}> {
  try {
    console.log('Starting agent evolution process');
    
    // Evolution configuration
    const evolutionThreshold = 0.7; // Evolution score threshold (0-1)
    // Note: The following variables are declared but not used currently
    // They are kept for future configuration adjustments
    // const minimumExecutions = 10; // Minimum executions before evolution
    // const failureRateThreshold = 0.3; // Failure rate that triggers evolution

    // Get agents that are candidates for evolution
    const agents = await getAgentsForEvolution(tenantId);
    console.log(`Found ${agents.length} agents to check for evolution`);
    
    let evolvedCount = 0;
    
    for (const agent of agents) {
      try {
        // Get usage statistics for this agent
        const stats = await getAgentUsageStats(agent.id);
        
        // Calculate performance score
        const performance = calculatePerformance(stats);
        console.log(`Agent ${agent.id} performance: ${performance.score.toFixed(2)}`);
        
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
              'agent_evolved',
              {
                old_agent_id: agent.id,
                new_agent_id: newAgent.id,
                plugin_id: agent.plugin_id,
                performance_score: performance.score,
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
      evolved: evolvedCount
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
