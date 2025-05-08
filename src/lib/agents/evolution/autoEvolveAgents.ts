
import { supabase } from '@/integrations/supabase/client';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { calculatePerformance } from './calculatePerformance';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Auto-evolve agents based on performance and feedback
 * @returns A summary of the evolution process
 */
export async function autoEvolveAgents() {
  const results = {
    evolved: 0,
    errors: 0,
    skipped: 0,
    details: [] as Array<{
      pluginId: string;
      status: 'evolved' | 'skipped' | 'error';
      reason?: string;
      newAgentVersionId?: string;
    }>
  };

  try {
    // Get agents that need evolution
    const agentsToEvolve = await getAgentsForEvolution();

    if (!agentsToEvolve.length) {
      return {
        ...results,
        message: 'No agents found that need evolution'
      };
    }

    // Process each agent
    for (const agent of agentsToEvolve) {
      try {
        // Calculate performance metrics
        const performance = await calculatePerformance(agent.id);
        
        if (!performance.shouldEvolve) {
          results.skipped++;
          results.details.push({
            pluginId: agent.pluginId,
            status: 'skipped',
            reason: 'Performance metrics do not suggest evolution is needed'
          });
          continue;
        }
        
        // Create evolved agent based on feedback
        const evolvedAgent = await createEvolvedAgent(agent.id, agent.pluginId, performance);
        
        if (!evolvedAgent) {
          results.errors++;
          results.details.push({
            pluginId: agent.pluginId,
            status: 'error',
            reason: 'Failed to create evolved agent'
          });
          continue;
        }
        
        // Deactivate old agent version
        await deactivateOldAgent(agent.id);
        
        // Log evolution event
        await logSystemEvent('system', 'agent', 'agent_evolved', {
          old_agent_id: agent.id,
          new_agent_id: evolvedAgent.id,
          plugin_id: agent.pluginId,
          reason: performance.evolveReason
        });
        
        results.evolved++;
        results.details.push({
          pluginId: agent.pluginId,
          status: 'evolved',
          newAgentVersionId: evolvedAgent.id
        });
        
      } catch (err: any) {
        console.error(`Error evolving agent ${agent.id}:`, err);
        results.errors++;
        results.details.push({
          pluginId: agent.pluginId,
          status: 'error',
          reason: err.message || 'Unknown error'
        });
      }
    }
    
    return {
      ...results,
      message: `Evolution process complete. Evolved: ${results.evolved}, Skipped: ${results.skipped}, Errors: ${results.errors}`
    };
    
  } catch (error: any) {
    console.error('Error in autoEvolveAgents:', error);
    return {
      ...results,
      message: `Failed to complete evolution process: ${error.message}`,
      error: error.message
    };
  }
}
