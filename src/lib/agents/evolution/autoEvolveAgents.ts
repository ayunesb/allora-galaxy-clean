
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { getAgentsForEvolution } from './getAgentsForEvolution';
import { getAgentUsageStats } from './getAgentUsageStats';
import { calculateAgentPerformance } from './calculatePerformance';
import { checkAgentEvolutionNeeded } from './checkEvolutionNeeded';
import { getAgentFeedbackComments } from './getFeedbackComments';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgentVersion } from './deactivateOldAgent';

/**
 * Auto-evolve all agents that need evolution
 */
export async function autoEvolveAgents(tenantId: string) {
  try {
    // Get agents that need evolution
    const agentsToEvolve = await getAgentsForEvolution();
    
    if (agentsToEvolve.length === 0) {
      console.log('No agents need evolution');
      return { evolved: 0, success: true };
    }
    
    // Get usage stats for performance calculation
    const usageStats = await getAgentUsageStats();
    
    // Process each agent
    let evolvedCount = 0;
    
    for (const agent of agentsToEvolve) {
      // Calculate agent performance
      const performance = calculateAgentPerformance(
        agent.id,
        agent.upvotes || 0,
        agent.downvotes || 0,
        usageStats
      );
      
      // Double-check if evolution is needed
      const needsEvolution = await checkAgentEvolutionNeeded(
        agent.id, 
        agent.upvotes || 0, 
        agent.downvotes || 0
      );
      
      if (needsEvolution) {
        // Get feedback comments
        const comments = await getAgentFeedbackComments(agent.id);
        
        // Create evolved version
        await createEvolvedAgent(
          agent.plugin_id,
          agent.prompt,
          agent.version,
          comments,
          tenantId
        );
        
        // Deactivate old version
        await deactivateOldAgentVersion(agent.id);
        
        evolvedCount++;
      }
    }
    
    await logSystemEvent(
      tenantId,
      'system',
      'auto_evolve_completed',
      { evolved_count: evolvedCount, total_checked: agentsToEvolve.length }
    );
    
    return { evolved: evolvedCount, success: true };
  } catch (error: any) {
    console.error('Error during auto-evolution:', error);
    
    // Log the error
    await logSystemEvent(
      tenantId,
      'system',
      'auto_evolve_error',
      { error: error.message || 'Unknown error' }
    );
    
    return { evolved: 0, success: false, error: error.message };
  }
}
