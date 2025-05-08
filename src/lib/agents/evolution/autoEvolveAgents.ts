
import { supabase } from '@/lib/supabase';
import { getPluginsForOptimization } from './getPluginsForOptimization';
import { calculateAgentPerformance } from './calculatePerformance';
import { getFeedbackComments } from './getFeedbackComments';
import { createEvolvedAgent } from './createEvolvedAgent';
import { deactivateOldAgent } from './deactivateOldAgent';
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

export interface EvolutionResult {
  agent_version_id: string;
  prompt: string;
}

/**
 * Auto-evolve agents based on performance and feedback
 */
export async function autoEvolveAgents() {
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
        
        // Get feedback comments for the current active agent
        const feedbackComments = await getFeedbackComments(plugin.active_agent_id);
        
        // Generate evolved prompt using feedback
        const evolvedPrompt = await evolvePromptWithFeedback(
          plugin.current_prompt,
          feedbackComments,
          metrics.evolutionReason || 'Regular performance optimization'
        );
        
        // Create new agent version
        const newAgent = await createEvolvedAgent(
          plugin.id,
          evolvedPrompt,
          metrics.evolutionReason || 'Auto-evolution based on performance metrics'
        );
        
        // Deactivate old agent version
        await deactivateOldAgent(plugin.active_agent_id);
        
        // Log the evolution
        await logSystemEvent(
          'system',
          'agent',
          'agent_evolved',
          {
            plugin_id: plugin.id,
            old_agent_id: plugin.active_agent_id,
            new_agent_id: newAgent.agent_version_id,
            reason: metrics.evolutionReason
          }
        );
        
        result.evolved++;
        result.details.push({
          plugin_id: plugin.id,
          status: 'evolved',
          reason: metrics.evolutionReason,
          newAgentVersionId: newAgent.agent_version_id
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
