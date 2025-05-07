
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/lib/strategy/types";
import { recordExecution } from "@/lib/executions/recordExecution";
import { supabase } from "@/integrations/supabase/client";

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  // Input validation
  if (!input.strategy_id) {
    return {
      success: false,
      error: "Strategy ID is required"
    };
  }

  if (!input.tenant_id) {
    return {
      success: false, 
      error: "Tenant ID is required"
    };
  }
  
  let executionId: string | null = null;
  const startTime = performance.now();
  
  try {
    // Record the execution start
    try {
      executionId = await recordExecution({
        tenant_id: input.tenant_id,
        type: 'strategy',
        status: 'pending',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        input: { strategy_id: input.strategy_id }
      });
    } catch (recordError) {
      console.error("Failed to record execution start, but continuing:", recordError);
      // Continue execution even if recording fails
    }

    // Execute the strategy
    const result = await runStrategy(input);

    // Record end time for performance tracking
    const executionTime = performance.now() - startTime;

    // Update the execution record on success
    if (result.success && executionId) {
      try {
        await recordExecution({
          tenant_id: input.tenant_id,
          type: 'strategy',
          status: 'success',
          strategy_id: input.strategy_id,
          executed_by: input.user_id,
          output: result.data,
          execution_time: executionTime,
          xp_earned: 25 // Default XP for successful execution
        });
      } catch (recordError) {
        console.error("Failed to update execution record on success, but continuing:", recordError);
      }

      // Auto-vote on agents after plugin success
      try {
        await autoVoteOnSuccessfulAgents(input.strategy_id, input.tenant_id, input.user_id);
      } catch (voteError) {
        console.error("Failed to auto-vote on agents, but continuing:", voteError);
      }
    } else if (!result.success && executionId) {
      // Record failure if the execution was unsuccessful
      try {
        await recordExecution({
          tenant_id: input.tenant_id,
          type: 'strategy',
          status: 'failure',
          strategy_id: input.strategy_id,
          executed_by: input.user_id,
          error: result.error || "Unknown error",
          execution_time: executionTime
        });
      } catch (recordError) {
        console.error("Failed to update execution record on failure, but continuing:", recordError);
      }
    }

    // Add execution metrics to the result
    return {
      ...result,
      execution_time: executionTime,
      execution_id: executionId
    };
  } catch (error: any) {
    // Record the execution failure
    try {
      if (input.tenant_id) {
        await recordExecution({
          tenant_id: input.tenant_id,
          type: 'strategy',
          status: 'failure',
          strategy_id: input.strategy_id,
          executed_by: input.user_id,
          error: error.message || 'Unknown error occurred',
          execution_time: performance.now() - startTime
        });
      }
    } catch (recordError) {
      console.error("Failed to record execution failure, continuing with error response:", recordError);
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy',
      execution_time: performance.now() - startTime,
      execution_id: executionId
    };
  }
}

/**
 * Automatically vote on agents that were successful in a strategy execution
 * This function is designed to continue despite individual failures
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

    if (error) {
      console.log('Error fetching successful plugins:', error);
      return;
    }
    
    if (!successfulPlugins || !successfulPlugins.length) {
      console.log('No successful plugins found for auto-voting');
      return;
    }

    // Extract unique agent version IDs
    const agentVersionIds = [...new Set(successfulPlugins
      .map(p => p.agent_version_id)
      .filter(id => id !== null && id !== undefined))];

    // Create a system vote for each successful agent version
    for (const agent_version_id of agentVersionIds) {
      if (!agent_version_id) continue;
      
      try {
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
      } catch (agentError) {
        console.error(`Error processing agent ${agent_version_id}:`, agentError);
        // Continue with next agent despite error
      }
    }
  } catch (err) {
    console.error('Error in auto-voting process:', err);
    // Function should not throw to prevent breaking the parent function
  }
}
