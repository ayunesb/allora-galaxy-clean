
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { calculateAgentPerformance } from './calculatePerformance';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateAgent } from './deactivateOldAgent';
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
      plugin_id: string;
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
        const performance = await calculateAgentPerformance(agent.id);
        
        if (!performance.shouldEvolve) {
          results.skipped++;
          results.details.push({
            plugin_id: agent.plugin_id,
            status: 'skipped',
            reason: 'Performance metrics do not suggest evolution is needed'
          });
          continue;
        }
        
        // Create evolved agent based on feedback
        const evolvedAgent = await createEvolvedAgent(agent.id, agent.plugin_id, performance);
        
        if (!evolvedAgent) {
          results.errors++;
          results.details.push({
            plugin_id: agent.plugin_id,
            status: 'error',
            reason: 'Failed to create evolved agent'
          });
          continue;
        }
        
        // Deactivate old agent version
        await deactivateAgent(agent.id);
        
        // Log evolution event
        await logSystemEvent('system', 'agent', 'agent_evolved', {
          old_agent_id: agent.id,
          new_agent_id: evolvedAgent.id,
          plugin_id: agent.plugin_id,
          reason: performance.evolveReason
        });
        
        results.evolved++;
        results.details.push({
          plugin_id: agent.plugin_id,
          status: 'evolved',
          newAgentVersionId: evolvedAgent.id
        });
        
      } catch (err: any) {
        console.error(`Error evolving agent ${agent.id}:`, err);
        results.errors++;
        results.details.push({
          plugin_id: agent.plugin_id,
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
