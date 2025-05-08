
// Fix import statements and function calls
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { checkAgentEvolutionNeeded } from './checkEvolutionNeeded';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateAgent } from './deactivateOldAgent';
import { calculateAgentPerformance } from './calculatePerformance';
import { getAgentFeedbackComments } from './getFeedbackComments';
import { getPluginsForOptimization } from './getPluginsForOptimization';

/**
 * Automatically evolves agents that meet criteria for evolution
 * This is typically run on a schedule (e.g. daily)
 */
export async function autoEvolveAgents() {
  try {
    // Get all agents that are candidates for evolution
    const agents = await getAgentsForEvolution();
    
    if (!agents || agents.length === 0) {
      console.log('No agents found that need evolution');
      return {
        success: true,
        evolved: 0,
        message: 'No agents found that need evolution'
      };
    }
    
    let evolvedCount = 0;
    
    // Process each agent
    for (const agent of agents) {
      // Check if this agent needs evolution based on various metrics
      const needsEvolution = await checkAgentEvolutionNeeded(agent.id);
      
      if (!needsEvolution) {
        continue;
      }
      
      // Get the agent's usage stats and feedback
      await calculateAgentPerformance(agent.id);
      const feedback = await getAgentFeedbackComments(agent.id);
      const relatedPlugins = await getPluginsForOptimization(agent.id);
      
      // Create a new evolved agent version
      const newAgent = await createEvolvedAgent(agent.id, feedback, relatedPlugins);
      
      if (newAgent) {
        // Deactivate the old agent version
        await deactivateAgent(agent.id);
        evolvedCount++;
        
        // Log the evolution event
        await logSystemEvent('agent', 'evolution', 'agent_evolved', {
          old_agent_id: agent.id,
          new_agent_id: newAgent.id,
          plugin_id: agent.plugin_id,
          feedback_count: feedback.length,
          related_plugins: relatedPlugins.length
        });
      }
    }
    
    return {
      success: true,
      evolved: evolvedCount,
      message: `Successfully evolved ${evolvedCount} agents`
    };
  } catch (error: any) {
    console.error('Error in autoEvolveAgents:', error);
    
    // Log the error
    await logSystemEvent('agent', 'evolution', 'agent_evolution_error', {
      error: error.message
    });
    
    return {
      success: false,
      evolved: 0,
      error: error.message,
      message: 'Failed to evolve agents'
    };
  }
}
