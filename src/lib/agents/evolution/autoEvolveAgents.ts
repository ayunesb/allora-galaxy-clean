
import { supabase } from '@/integrations/supabase/client';
import { createEvolvedAgent } from './createEvolvedAgent';
import { getAgentUsageStats } from './getAgentUsageStats';
import { getFeedbackComments } from './getFeedbackComments';
import { deactivateOldAgent } from './deactivateOldAgent';
import { checkEvolutionNeeded } from './checkEvolutionNeeded';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface AutoEvolveResult {
  success: boolean;
  evolvedAgents: number;
  errors: string[];
}

/**
 * CRON-triggered function to automatically evolve agents based on feedback
 */
export async function autoEvolveAgents(tenantId: string): Promise<AutoEvolveResult> {
  const result: AutoEvolveResult = {
    success: false,
    evolvedAgents: 0,
    errors: []
  };
  
  try {
    // Get all active agents that are candidates for evolution
    const { data: agents, error: agentsError } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version, prompt, upvotes, downvotes, created_at')
      .eq('status', 'active')
      .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (agentsError) {
      result.errors.push(`Failed to fetch agents: ${agentsError.message}`);
      return result;
    }
    
    // Check each agent for evolution
    const evolutionPromises = agents.map(async (agent) => {
      try {
        // Check if evolution is needed
        const usageStats = await getAgentUsageStats(agent.id);
        
        const evolutionNeeded = checkEvolutionNeeded({
          agentId: agent.id,
          upvotes: agent.upvotes,
          downvotes: agent.downvotes,
          executionCount: usageStats.executionCount,
          errorRate: usageStats.errorRate,
          daysSinceCreation: usageStats.daysSinceCreation
        });
        
        if (!evolutionNeeded) {
          return false;
        }
        
        // Get feedback comments for the agent
        const feedback = await getFeedbackComments(agent.id);
        
        // Generate evolved prompt using the feedback
        const evolvedPrompt = await generateEvolvedPrompt(agent.prompt, feedback);
        
        // Create evolved agent
        const evolutionResult = await createEvolvedAgent({
          parentAgentVersionId: agent.id,
          tenantId,
          userId: 'system', // System-generated evolution
          prompt: evolvedPrompt,
          feedbackIncorporated: feedback.map(f => f.id)
        });
        
        if (!evolutionResult.success) {
          result.errors.push(`Failed to evolve agent ${agent.id}: ${evolutionResult.error}`);
          return false;
        }
        
        // Deactivate old agent
        await deactivateOldAgent(agent.id, evolutionResult.agentVersionId!);
        
        // Log successful evolution
        await logSystemEvent('agent', 'info', {
          action: 'auto_evolve_agent',
          old_agent_id: agent.id,
          new_agent_id: evolutionResult.agentVersionId,
          feedback_count: feedback.length
        }, tenantId);
        
        return true;
      } catch (error: any) {
        result.errors.push(`Error evolving agent ${agent.id}: ${error.message}`);
        return false;
      }
    });
    
    // Wait for all evolution processes to complete
    const evolutionResults = await Promise.all(evolutionPromises);
    
    // Count successful evolutions
    result.evolvedAgents = evolutionResults.filter(Boolean).length;
    result.success = result.evolvedAgents > 0 || agents.length === 0;
    
    return result;
  } catch (error: any) {
    result.errors.push(`Unexpected error during auto-evolution: ${error.message}`);
    return result;
  }
}

/**
 * Generate an evolved prompt based on feedback
 * This is a simple placeholder - in a real system, this would use an LLM
 */
async function generateEvolvedPrompt(
  originalPrompt: string,
  feedback: Array<{ comment: string; voteType: 'up' | 'down' }>
): Promise<string> {
  // Placeholder implementation
  // In a real system, this would use an LLM to incorporate feedback
  const feedbackSummary = feedback
    .map(f => `${f.voteType === 'up' ? '👍' : '👎'} ${f.comment}`)
    .join('\n');
    
  return `${originalPrompt}\n\n## Feedback incorporated in this version:\n${feedbackSummary}`;
}
