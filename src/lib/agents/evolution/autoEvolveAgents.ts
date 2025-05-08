
// Remove unused variable 'performance'
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { calculatePerformance } from './calculatePerformance';
import { getFeedbackComments } from './getFeedbackComments';
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
      const needsEvolution = await checkEvolutionNeeded(agent.id);
      
      if (!needsEvolution) {
        continue;
      }
      
      // Get the agent's usage stats and feedback
      // Removed: const performance = await calculatePerformance(agent.id);
      await calculatePerformance(agent.id); // Call but don't store the result since it's not used
      const feedback = await getFeedbackComments(agent.id);
      const relatedPlugins = await getPluginsForOptimization(agent.id);
      
      // Create a new evolved agent version
      const newAgent = await createEvolvedAgent(agent.id, feedback, relatedPlugins);
      
      if (newAgent) {
        // Deactivate the old agent version
        await deactivateOldAgent(agent.id);
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
