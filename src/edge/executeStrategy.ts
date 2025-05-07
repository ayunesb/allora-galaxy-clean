
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/lib/strategy/types";
import { recordExecution } from "@/lib/executions/recordExecution";
import { supabase } from "@/integrations/supabase/client";

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Record the execution start
    const executionId = await recordExecution({
      tenant_id: input.tenant_id || '',
      type: 'strategy',
      status: 'pending',
      strategy_id: input.strategy_id,
      executed_by: input.user_id,
      input: { strategy_id: input.strategy_id }
    });

    // Execute the strategy
    const result = await runStrategy(input);

    // Update the execution record on success
    if (result.success && executionId) {
      await recordExecution({
        tenant_id: input.tenant_id || '',
        type: 'strategy',
        status: 'success',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        output: result.data,
        execution_time: performance.now(), // This would be more accurate with a start time
        xp_earned: 25 // Default XP for successful execution
      });

      // Auto-vote on agents after plugin success
      await autoVoteOnSuccessfulAgents(input.strategy_id, input.tenant_id || '', input.user_id);
    }

    return result;
  } catch (error: any) {
    // Record the execution failure
    if (input.tenant_id) {
      await recordExecution({
        tenant_id: input.tenant_id,
        type: 'strategy',
        status: 'failure',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        error: error.message || 'Unknown error occurred',
        execution_time: 0
      });
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy'
    };
  }
}

/**
 * Automatically vote on agents that were successful in a strategy execution
 */
async function autoVoteOnSuccessfulAgents(
  strategy_id: string,
  tenant_id: string,
  user_id?: string
): Promise<void> {
  try {
    // Get all successful plugin executions for this strategy
    const { data: successfulPlugins, error } = await supabase
      .from('plugin_logs')
      .select('agent_version_id')
      .eq('strategy_id', strategy_id)
      .eq('status', 'success')
      .not('agent_version_id', 'is', null);

    if (error || !successfulPlugins || !successfulPlugins.length) {
      console.log('No successful plugins found or error fetching:', error);
      return;
    }

    // Extract unique agent version IDs
    const agentVersionIds = [...new Set(successfulPlugins.map(p => p.agent_version_id))];

    // Create a system vote for each successful agent version
    for (const agent_version_id of agentVersionIds) {
      if (!agent_version_id) continue;
      
      // Check if a vote from the system already exists for this agent version
      const { data: existingVote, error: voteError } = await supabase
        .from('agent_votes')
        .select('id')
        .eq('agent_version_id', agent_version_id)
        .eq('vote_type', 'up')
        .eq('user_id', user_id || 'system')
        .maybeSingle();
        
      if (voteError) {
        console.error('Error checking for existing votes:', voteError);
        continue;
      }

      // If no existing vote, create one
      if (!existingVote) {
        const { error: insertError } = await supabase
          .from('agent_votes')
          .insert({
            agent_version_id,
            user_id: user_id || 'system',
            vote_type: 'up',
            comment: 'Automated upvote for successful execution'
          });
          
        if (insertError) {
          console.error('Error creating auto-vote:', insertError);
        } else {
          console.log(`Auto-upvote created for agent version ${agent_version_id}`);
          
          // Update the agent version upvote count
          await supabase
            .from('agent_versions')
            .update({
              upvotes: supabase.rpc('increment', { amount: 1 }),
              xp: supabase.rpc('increment', { amount: 5 })
            })
            .eq('id', agent_version_id);
        }
      }
    }
  } catch (err) {
    console.error('Error in auto-voting process:', err);
  }
}
