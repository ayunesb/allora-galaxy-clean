
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentVote {
  vote_type: 'up' | 'down';
  count: number;
}

interface ExecutionCount {
  status: 'success' | 'failure' | 'pending';
  count: number;
}

interface EvolutionCriteria {
  minimumVotes: number;
  minimumDownvoteRatio: number;
  minimumExecutions: number;
  maximumSuccessRate: number;
}

// Default criteria for triggering evolution
const DEFAULT_CRITERIA: EvolutionCriteria = {
  minimumVotes: 10,
  minimumDownvoteRatio: 0.3, // At least 30% downvotes
  minimumExecutions: 20,
  maximumSuccessRate: 0.7, // At most 70% success rate
};

// Function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available
    if (typeof Deno !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for non-Deno environments
    return process.env[name] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Log helper function
function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-EVOLVE] ${step}${detailsStr}`);
}

async function checkAgentEvolutionStatus(
  supabase: any,
  agentVersionId: string,
  tenantId: string,
  criteria: EvolutionCriteria = DEFAULT_CRITERIA
): Promise<{
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
    const upvotes = (voteData?.find(d => d.vote_type === 'up')?.count as number) || 0;
    const downvotes = (voteData?.find(d => d.vote_type === 'down')?.count as number) || 0;
    const totalVotes = upvotes + downvotes;
    const downvoteRatio = totalVotes > 0 ? downvotes / totalVotes : 0;

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
    const successfulExecutions = (execData?.find(d => d.status === 'success')?.count as number) || 0;
    const failedExecutions = (execData?.find(d => d.status === 'failure')?.count as number) || 0;
    const totalExecutions = successfulExecutions + failedExecutions;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    // Determine if agent should evolve based on criteria
    const shouldEvolve = 
      totalVotes >= criteria.minimumVotes && 
      downvoteRatio >= criteria.minimumDownvoteRatio && 
      totalExecutions >= criteria.minimumExecutions && 
      successRate <= criteria.maximumSuccessRate;
    
    const reason = !shouldEvolve 
      ? (totalVotes < criteria.minimumVotes 
          ? "Not enough votes"
          : downvoteRatio < criteria.minimumDownvoteRatio
          ? "Downvote ratio too low"
          : totalExecutions < criteria.minimumExecutions 
          ? "Not enough executions"
          : successRate > criteria.maximumSuccessRate 
          ? "Success rate too high"
          : "Unknown reason")
      : "Agent meets evolution criteria";

    return {
      shouldEvolve,
      votes: { upvotes, downvotes, ratio: downvoteRatio },
      executions: { success: successfulExecutions, failure: failedExecutions, rate: successRate },
      reason
    };
  } catch (error: any) {
    console.error("Error checking agent evolution status:", error);
    throw error;
  }
}

async function evolveAgent(
  supabase: any,
  agentVersionId: string,
  tenantId: string
): Promise<{
  success: boolean;
  message: string;
  newAgentId?: string;
  error?: string;
}> {
  try {
    // Step 1: Get current agent version details
    const { data: currentAgent, error: agentError } = await supabase
      .from('agent_versions')
      .select('*, plugins:plugin_id(*)')
      .eq('id', agentVersionId)
      .single();

    if (agentError || !currentAgent) {
      throw new Error(`Failed to fetch agent version: ${agentError?.message || 'Unknown error'}`);
    }

    // Step 2: Get feedback from votes to improve the prompt
    const { data: votes, error: votesError } = await supabase
      .from('agent_votes')
      .select('comment, vote_type')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (votesError) {
      throw new Error(`Failed to fetch agent votes: ${votesError.message}`);
    }

    // Step 3: Generate new version with evolution number incremented
    const currentVersion = currentAgent.version || '1.0.0';
    const versionParts = currentVersion.split('.');
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2] || '0') + 1}`;

    // Step 4: Generate improved prompt based on feedback and performance
    // In a real implementation, this would use AI to improve the prompt
    const positiveComments = votes?.filter(v => v.vote_type === 'up').map(v => v.comment).join('\n');
    const negativeComments = votes?.filter(v => v.vote_type === 'down').map(v => v.comment).join('\n');
    
    const improvedPrompt = `${currentAgent.prompt}\n\n/* Auto-evolved from version ${currentVersion} to ${newVersion} */\n\n` +
      `Positive feedback:\n${positiveComments || 'None'}\n\n` +
      `Areas for improvement:\n${negativeComments || 'None'}\n\n` + 
      `This is an automatically evolved version of the agent based on user feedback and performance metrics.`;

    // Step 5: Insert new agent version
    const { data: newAgent, error: insertError } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: currentAgent.plugin_id,
        version: newVersion,
        prompt: improvedPrompt,
        status: 'active',
        created_by: null, // Auto-evolved
        xp: 0,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (insertError || !newAgent) {
      throw new Error(`Failed to create new agent version: ${insertError?.message || 'Unknown error'}`);
    }

    // Step 6: Update status of the old version to deprecated
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ status: 'deprecated' })
      .eq('id', agentVersionId);

    if (updateError) {
      throw new Error(`Failed to update old agent version: ${updateError.message}`);
    }

    // Step 7: Log the evolution event
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module: 'agent',
        event: 'agent_auto_evolved',
        context: {
          old_agent_id: agentVersionId,
          new_agent_id: newAgent.id,
          plugin_id: currentAgent.plugin_id,
          old_version: currentVersion,
          new_version: newVersion
        }
      });

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

async function checkAndEvolveAgents(
  supabase: any,
  tenantId?: string,
  criteria: EvolutionCriteria = DEFAULT_CRITERIA
): Promise<{
  success: boolean;
  evolved: { agent_id: string; new_agent_id: string; version: string }[];
  errors: { agent_id: string; error: string }[];
}> {
  const evolved: { agent_id: string; new_agent_id: string; version: string }[] = [];
  const errors: { agent_id: string; error: string }[] = [];

  try {
    // Step 1: Get all active agent versions
    let query = supabase
      .from('agent_versions')
      .select('id, plugin_id, version')
      .eq('status', 'active');
      
    if (tenantId) {
      // If tenant ID provided, filter by plugins for that tenant
      query = query.in('plugin_id', 
        supabase.from('plugins')
          .select('id')
          .eq('tenant_id', tenantId)
      );
    }

    const { data: activeAgents, error: agentError } = await query;

    if (agentError) {
      throw new Error(`Failed to fetch active agents: ${agentError.message}`);
    }

    logStep("Found active agents", { count: activeAgents?.length || 0 });

    if (!activeAgents || activeAgents.length === 0) {
      return { success: true, evolved: [], errors: [] };
    }

    // Step 2: Process each agent
    for (const agent of activeAgents) {
      try {
        // For each agent, first check if it meets evolution criteria
        const tenantIdToUse = tenantId || 'system'; // Fallback for cases where tenant ID isn't provided
        
        const evolutionStatus = await checkAgentEvolutionStatus(
          supabase, 
          agent.id, 
          tenantIdToUse, 
          criteria
        );
        
        logStep(`Agent ${agent.id} evolution check`, { 
          shouldEvolve: evolutionStatus.shouldEvolve, 
          reason: evolutionStatus.reason 
        });
        
        // If it meets criteria, evolve it
        if (evolutionStatus.shouldEvolve) {
          const result = await evolveAgent(supabase, agent.id, tenantIdToUse);
          
          if (result.success && result.newAgentId) {
            evolved.push({
              agent_id: agent.id,
              new_agent_id: result.newAgentId,
              version: agent.version
            });
          } else {
            errors.push({
              agent_id: agent.id,
              error: result.error || "Unknown error during evolution"
            });
          }
        }
      } catch (agentError: any) {
        errors.push({
          agent_id: agent.id,
          error: agentError.message
        });
      }
    }

    logStep("Evolution complete", { 
      total: activeAgents.length,
      evolved: evolved.length,
      errors: errors.length
    });

    return {
      success: true,
      evolved,
      errors
    };
  } catch (error: any) {
    logStep("Fatal error in checkAndEvolveAgents", { error: error.message });
    return {
      success: false,
      evolved,
      errors: [{ agent_id: "global", error: error.message }]
    };
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting autoEvolveAgents function");
    
    // Get Supabase credentials
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body if present
    let tenantId: string | undefined = undefined;
    let criteria = DEFAULT_CRITERIA;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        tenantId = body.tenant_id;
        
        if (body.criteria) {
          criteria = {
            ...DEFAULT_CRITERIA,
            ...body.criteria
          };
        }
      } catch (e) {
        // If parsing fails, use default values
      }
    }
    
    logStep("Configuration", { 
      tenantId: tenantId || "all tenants",
      criteria
    });
    
    // Run the evolution process
    const result = await checkAndEvolveAgents(supabase, tenantId, criteria);
    
    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    });
  } catch (error) {
    console.error("Error in autoEvolveAgents:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
