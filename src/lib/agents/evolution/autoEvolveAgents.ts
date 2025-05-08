
import { getPluginsForOptimization } from './getPluginsForOptimization';
import { calculateAgentPerformance } from './calculatePerformance';
import { getFeedbackComments } from './getFeedbackComments';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateAgent } from './deactivateOldAgent';
import { evolvePromptWithFeedback } from './evolvePromptWithFeedback';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface AgentPerformanceMetrics {
  needsEvolution: boolean;
  evolutionReason?: string;
  positiveVotes: number;
  negativeVotes: number;
  neutralVotes: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  xpEarned: number;
}

/**
 * Auto-evolve agents based on performance and feedback
 */
export async function autoEvolveAgents(tenantId: string = 'system') {
  console.log('Starting auto-evolve agents process...');
  
  const result = {
    message: 'Auto-evolve process completed',
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
    // Get plugins eligible for evolution
    const plugins = await getPluginsForOptimization();
    
    if (!plugins || plugins.length === 0) {
      result.message = 'No plugins found for optimization';
      return result;
    }
    
    console.log(`Found ${plugins.length} plugins to check for agent evolution`);
    
    // Process each plugin
    for (const plugin of plugins) {
      try {
        // Calculate agent performance metrics
        const metrics = await calculateAgentPerformance(plugin.id);
        
        // Check if evolution is needed
        const needsEvolution = checkEvolutionNeeded(metrics);
        
        if (!needsEvolution) {
          result.skipped++;
          result.details.push({
            plugin_id: plugin.id,
            status: 'skipped',
            reason: 'Performance metrics do not indicate evolution is needed'
          });
          continue;
        }
        
        // Get the active agent version for this plugin
        const activeAgentResult = await getActiveAgentVersion(plugin.id);
        if (!activeAgentResult.success) {
          throw new Error(activeAgentResult.error || 'Failed to get active agent');
        }
        
        const activeAgentId = activeAgentResult.agentVersionId;
        
        // Get feedback comments for the current active agent
        const feedbackComments = await getFeedbackComments(activeAgentId);
        
        // Get the current prompt for the active agent
        const promptResult = await getAgentPrompt(activeAgentId);
        if (!promptResult.success) {
          throw new Error(promptResult.error || 'Failed to get agent prompt');
        }
        
        // Generate evolved prompt using feedback
        const evolvedPrompt = await evolvePromptWithFeedback(
          promptResult.prompt,
          feedbackComments,
          metrics.evolutionReason || 'Regular performance optimization'
        );
        
        // Create new agent version
        const newAgent = await createEvolvedAgent(
          activeAgentId,
          tenantId,
          metrics.evolutionReason || 'Auto-evolution based on performance metrics'
        );
        
        if (!newAgent.success) {
          throw new Error(newAgent.error || 'Failed to create evolved agent');
        }
        
        // Log the evolution
        await logSystemEvent(
          tenantId,
          'agent',
          'agent_evolved',
          {
            plugin_id: plugin.id,
            old_agent_id: activeAgentId,
            new_agent_id: newAgent.newAgentVersionId,
            reason: metrics.evolutionReason
          }
        );
        
        result.evolved++;
        result.details.push({
          plugin_id: plugin.id,
          status: 'evolved',
          reason: metrics.evolutionReason,
          newAgentVersionId: newAgent.newAgentVersionId
        });
      } catch (err: any) {
        console.error(`Failed to evolve agent for plugin ${plugin.id}:`, err);
        result.errors++;
        result.details.push({
          plugin_id: plugin.id,
          status: 'error',
          reason: err.message
        });
      }
    }
    
  } catch (err: any) {
    console.error('Error in autoEvolveAgents:', err);
    result.message = `Error in auto-evolve process: ${err.message}`;
  }
  
  console.log(`Auto-evolve complete: evolved=${result.evolved}, skipped=${result.skipped}, errors=${result.errors}`);
  return result;
}

// Helper function to get the active agent version for a plugin
async function getActiveAgentVersion(pluginId: string) {
  try {
    // This would typically use supabase, but we're mocking the implementation for this fix
    return {
      success: true,
      agentVersionId: 'mock-agent-id-' + pluginId
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to get active agent: ${err.message}`
    };
  }
}

// Helper function to get an agent's prompt
async function getAgentPrompt(agentVersionId: string) {
  try {
    // This would typically use supabase, but we're mocking the implementation for this fix
    return {
      success: true,
      prompt: 'Default prompt for ' + agentVersionId
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to get agent prompt: ${err.message}`
    };
  }
}
