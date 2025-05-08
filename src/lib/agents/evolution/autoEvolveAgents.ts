
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface AutoEvolveResult {
  success: boolean;
  message: string;
  error?: string;
  agentsEvolved: number;
  evolvedAgentIds?: string[];
}

interface AgentData {
  id: string;
  upvotes: number;
  downvotes: number;
  executionCount: number;
  errorRate: number;
  daysSinceCreation: number;
}

interface EvolutionConfig {
  minimumExecutions: number;
  failureRateThreshold: number;
  staleDays: number;
  batchSize: number;
}

/**
 * Auto-evolve agents based on performance metrics and user feedback
 */
export async function autoEvolveAgents(
  tenantId: string,
  config?: Partial<EvolutionConfig>
): Promise<AutoEvolveResult> {
  try {
    const evolveConfig: EvolutionConfig = {
      minimumExecutions: config?.minimumExecutions || 10,
      failureRateThreshold: config?.failureRateThreshold || 0.3,
      staleDays: config?.staleDays || 14,
      batchSize: config?.batchSize || 5
    };

    // Log beginning of auto-evolution
    await logSystemEvent('agent', 'info', {
      event: 'auto_evolve_started',
      tenant_id: tenantId,
      config: JSON.stringify(evolveConfig)
    });

    // Get agents needing evolution
    const agentsToEvolve = await getAgentsNeedingEvolution(tenantId, evolveConfig);

    if (agentsToEvolve.length === 0) {
      return {
        success: true,
        message: 'No agents needed evolution at this time',
        agentsEvolved: 0
      };
    }

    // Process each agent that needs evolution
    const evolvedAgentIds: string[] = [];
    let successCount = 0;

    for (const agent of agentsToEvolve) {
      try {
        // Get user feedback for this agent
        const { data: votesData } = await supabase
          .from('agent_votes')
          .select('comment, vote_type, created_at')
          .eq('agent_version_id', agent.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const userFeedback = votesData ? votesData.map(vote => ({
          comment: vote.comment || '',
          voteType: vote.vote_type === 'upvote' ? 'up' : 'down'
        })) : [];

        // Clone the agent with improvements
        const { data: newAgent, error: evolutionError } = await supabase
          .from('agent_versions')
          .insert({
            plugin_id: agent.id, // Assuming this is the parent plugin
            version: `evolved-${new Date().toISOString()}`,
            prompt: `Evolved based on ${agent.executionCount} executions with ${agent.errorRate}% failure rate`,
            status: 'draft',
            created_by: 'system'
          })
          .select('id')
          .single();

        if (evolutionError) {
          throw new Error(`Failed to create evolved agent: ${evolutionError.message}`);
        }

        // Log successful evolution
        await logSystemEvent('agent', 'success', {
          event: 'agent_evolved',
          original_agent_id: agent.id,
          new_agent_id: newAgent.id,
          tenant_id: tenantId
        });

        evolvedAgentIds.push(newAgent.id);
        successCount++;
      } catch (err: any) {
        console.error(`Error evolving agent ${agent.id}:`, err);
        
        // Log evolution failure
        await logSystemEvent('agent', 'error', {
          event: 'agent_evolution_failed',
          agent_id: agent.id,
          error: err.message,
          tenant_id: tenantId
        });
      }
    }

    return {
      success: true,
      message: `Successfully evolved ${successCount} of ${agentsToEvolve.length} agents`,
      agentsEvolved: successCount,
      evolvedAgentIds
    };
  } catch (err: any) {
    console.error('Auto-evolve agents error:', err);
    
    // Log overall failure
    await logSystemEvent('agent', 'error', {
      event: 'auto_evolve_failed',
      error: err.message,
      tenant_id: tenantId
    });

    return {
      success: false,
      message: 'Failed to auto-evolve agents',
      error: err.message,
      agentsEvolved: 0
    };
  }
}

/**
 * Get agents that need evolution based on performance metrics
 */
async function getAgentsNeedingEvolution(
  tenantId: string,
  config: EvolutionConfig
): Promise<AgentData[]> {
  // This would typically involve a complex query against execution logs,
  // agent versions, and feedback to identify which agents need improvement.
  // For now, we'll use a simplified approach:
  
  const { data, error } = await supabase
    .from('agent_versions')
    .select('id, upvotes, downvotes, created_at')
    .eq('status', 'active')
    .limit(config.batchSize);

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  const agentsToEvolve: AgentData[] = [];

  for (const agent of (data || [])) {
    // Get execution stats for this agent
    const now = new Date();
    const createdAt = new Date(agent.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // For demo, we'll consider an agent needs evolution if it:
    // 1. Has more downvotes than upvotes
    // 2. Has been active for more than the stale days threshold
    const totalVotes = (agent.upvotes || 0) + (agent.downvotes || 0);
    const hasNegativeFeedback = totalVotes > 5 && (agent.downvotes || 0) > (agent.upvotes || 0);
    const isStale = daysSinceCreation > config.staleDays;
    
    // Mock execution data (would come from database in real implementation)
    const executionCount = 20;
    const errorRate = 0.15;
    
    if (hasNegativeFeedback || isStale) {
      agentsToEvolve.push({
        id: agent.id,
        upvotes: agent.upvotes || 0,
        downvotes: agent.downvotes || 0,
        executionCount,
        errorRate,
        daysSinceCreation
      });
    }
  }

  return agentsToEvolve;
}
