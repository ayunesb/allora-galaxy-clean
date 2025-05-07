
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { notifyError, notifySuccess } from '@/components/ui/BetterToast';

interface EvolutionTrigger {
  pluginId: string;
  minimumVotes: number;
  minimumRatio: number;  // e.g. 0.6 means 60% of votes must be upvotes
  averageExecutionTime?: number;
  successRate?: number;
}

interface EvolutionResult {
  success: boolean;
  message: string;
  newAgentId?: string;
  error?: string;
}

/**
 * Check if an agent version meets the criteria for evolution
 */
export async function checkAgentEvolutionStatus(agentVersionId: string, tenantId: string): Promise<{
  shouldEvolve: boolean;
  votes: { upvotes: number; downvotes: number; ratio: number }
  executions: { success: number; failure: number; rate: number }
  reason?: string;
}> {
  try {
    // Get the agent version data
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();

    if (agentError || !agent) {
      throw new Error(`Agent version not found: ${agentError?.message || 'Unknown error'}`);
    }

    // Get the agent votes
    const { data: voteData, error: voteError } = await supabase
      .from('agent_votes')
      .select('vote_type, count')
      .eq('agent_version_id', agentVersionId)
      .group('vote_type')
      .count();

    if (voteError) {
      throw new Error(`Error fetching agent votes: ${voteError.message}`);
    }

    // Calculate vote stats
    const upvotes = voteData?.find(d => d.vote_type === 'up')?.count || 0;
    const downvotes = voteData?.find(d => d.vote_type === 'down')?.count || 0;
    const totalVotes = upvotes + downvotes;
    const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;

    // Get execution stats
    const { data: execData, error: execError } = await supabase
      .from('plugin_logs')
      .select('status, count')
      .eq('agent_version_id', agentVersionId)
      .eq('tenant_id', tenantId)
      .group('status')
      .count();

    if (execError) {
      throw new Error(`Error fetching execution logs: ${execError.message}`);
    }

    // Calculate execution stats
    const successfulExecutions = execData?.find(d => d.status === 'success')?.count || 0;
    const failedExecutions = execData?.find(d => d.status === 'failure')?.count || 0;
    const totalExecutions = successfulExecutions + failedExecutions;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    // Determine if agent should evolve based on criteria
    const shouldEvolve = 
      totalVotes >= 10 && voteRatio < 0.4 && totalExecutions >= 20 && successRate < 0.7;
    
    const reason = !shouldEvolve 
      ? (totalVotes < 10 
          ? "Not enough votes"
          : voteRatio >= 0.4 
          ? "Vote ratio too high"
          : totalExecutions < 20 
          ? "Not enough executions"
          : successRate >= 0.7 
          ? "Success rate too high"
          : "Unknown reason")
      : "Agent meets evolution criteria";

    return {
      shouldEvolve,
      votes: { upvotes, downvotes, ratio: voteRatio },
      executions: { success: successfulExecutions, failure: failedExecutions, rate: successRate },
      reason
    };
  } catch (error: any) {
    console.error("Error checking agent evolution status:", error);
    return {
      shouldEvolve: false,
      votes: { upvotes: 0, downvotes: 0, ratio: 0 },
      executions: { success: 0, failure: 0, rate: 0 },
      reason: `Error: ${error.message}`
    };
  }
}

/**
 * Initiate the evolution of an agent version based on feedback and performance
 */
export async function evolveAgent(
  agentVersionId: string,
  tenantId: string,
  userId?: string
): Promise<EvolutionResult> {
  try {
    // Step 1: Check if agent meets evolution criteria
    const evolutionStatus = await checkAgentEvolutionStatus(agentVersionId, tenantId);
    
    if (!evolutionStatus.shouldEvolve) {
      return {
        success: false,
        message: `Agent does not meet evolution criteria: ${evolutionStatus.reason}`,
      };
    }

    // Step 2: Get current agent version details
    const { data: currentAgent, error: agentError } = await supabase
      .from('agent_versions')
      .select('*, plugins:plugin_id(*)')
      .eq('id', agentVersionId)
      .single();

    if (agentError || !currentAgent) {
      throw new Error(`Failed to fetch agent version: ${agentError?.message || 'Unknown error'}`);
    }

    // Step 3: Get feedback from votes to improve the prompt
    const { data: votes, error: votesError } = await supabase
      .from('agent_votes')
      .select('comment')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (votesError) {
      throw new Error(`Failed to fetch agent votes: ${votesError.message}`);
    }

    // Step 4: Generate new version with evolution number incremented
    const currentVersion = currentAgent.version || '1.0.0';
    const versionParts = currentVersion.split('.');
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2] || '0') + 1}`;

    // Step 5: Generate improved prompt based on feedback and performance
    // In a real implementation, this would use AI to improve the prompt
    const feedbackComments = votes?.map(v => v.comment).filter(Boolean).join('\n');
    const improvedPrompt = `${currentAgent.prompt}\n\n/* Auto-evolved based on user feedback */\n\n${feedbackComments ? `Feedback incorporated:\n${feedbackComments}` : 'No specific feedback provided, general improvements made.'}`;

    // Step 6: Insert new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: currentAgent.plugin_id,
        version: newVersion,
        prompt: improvedPrompt,
        status: 'active',
        created_by: userId,
        xp: 0,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (insertError || !newAgent) {
      throw new Error(`Failed to create new agent version: ${insertError?.message || 'Unknown error'}`);
    }

    // Step 7: Update status of the old version to deprecated
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ status: 'deprecated' })
      .eq('id', agentVersionId);

    if (updateError) {
      throw new Error(`Failed to update old agent version: ${updateError.message}`);
    }

    // Step 8: Log the evolution event
    await logSystemEvent(
      tenantId,
      'agent',
      'agent_evolved',
      {
        old_agent_id: agentVersionId,
        new_agent_id: newAgent.id,
        plugin_id: currentAgent.plugin_id,
        votes: evolutionStatus.votes,
        executions: evolutionStatus.executions,
        evolved_by: userId || 'system'
      }
    );

    return {
      success: true,
      message: `Agent successfully evolved to version ${newVersion}`,
      newAgentId: newAgent.id
    };
  } catch (error: any) {
    console.error("Error evolving agent:", error);
    return {
      success: false,
      message: "Failed to evolve agent",
      error: error.message
    };
  }
}

/**
 * Check all agents that might need evolution and trigger evolution if needed
 * This function can be called periodically by a CRON job or edge function
 */
export async function checkAndEvolveAgents(tenantId: string, userId?: string): Promise<{
  success: boolean;
  evolved: number;
  errors: string[];
}> {
  try {
    const errors: string[] = [];
    let evolvedCount = 0;

    // Get active agent versions
    const { data: activeAgents, error: agentError } = await supabase
      .from('agent_versions')
      .select('id, plugin_id, version')
      .eq('status', 'active');

    if (agentError) {
      throw new Error(`Failed to fetch active agents: ${agentError.message}`);
    }

    if (!activeAgents || activeAgents.length === 0) {
      return { success: true, evolved: 0, errors: [] };
    }

    // Check each agent for evolution criteria
    for (const agent of activeAgents) {
      try {
        const evolutionStatus = await checkAgentEvolutionStatus(agent.id, tenantId);
        
        if (evolutionStatus.shouldEvolve) {
          const result = await evolveAgent(agent.id, tenantId, userId);
          if (result.success) {
            evolvedCount++;
          } else {
            errors.push(`Agent ${agent.id} (${agent.version}): ${result.error || 'Unknown error'}`);
          }
        }
      } catch (agentError: any) {
        errors.push(`Error processing agent ${agent.id}: ${agentError.message}`);
      }
    }

    return {
      success: true,
      evolved: evolvedCount,
      errors
    };
  } catch (error: any) {
    console.error("Error in checkAndEvolveAgents:", error);
    return {
      success: false,
      evolved: 0,
      errors: [error.message]
    };
  }
}
