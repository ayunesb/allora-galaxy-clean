
// Deno edge function to auto-evolve agents based on performance metrics
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe environment variable access function
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

// Type definitions
interface AgentVote {
  vote_type: 'up' | 'down';
  comment?: string;
  count: number;
}

interface ExecutionStats {
  status: 'success' | 'failure' | 'pending';
  count: number;
}

interface EvolutionCriteria {
  minimumVotes: number;
  minimumUpvoteRatio: number;
  minimumExecutions: number;
  minimumSuccessRate: number;
  minimumXp: number;
}

// Default criteria for triggering evolution
const DEFAULT_CRITERIA: EvolutionCriteria = {
  minimumVotes: 10,
  minimumUpvoteRatio: 0.6, // At least 60% upvotes
  minimumExecutions: 5,
  minimumSuccessRate: 0.7, // At least 70% success rate
  minimumXp: 100 // Minimum XP threshold
};

// Helper function for logging steps with timestamps
function logStep(step: string, details?: any) {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? `: ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [AUTO-EVOLVE] ${step}${detailsStr}`);
}

/**
 * Check if an agent meets the criteria for evolution
 * @param supabase Supabase client
 * @param agentVersionId Agent version ID to check
 * @param tenantId Tenant ID
 * @param criteria Evolution criteria
 */
async function checkAgentEvolutionStatus(
  supabase: any,
  agentVersionId: string,
  tenantId: string,
  criteria: EvolutionCriteria = DEFAULT_CRITERIA
): Promise<{
  shouldEvolve: boolean;
  votes: { up: number; down: number; total: number; ratio: number }
  executions: { success: number; failure: number; total: number; rate: number }
  xp: number;
  reason?: string;
}> {
  try {
    logStep(`Checking evolution status for agent ${agentVersionId}`);
    
    // Get the agent version data with error handling
    const { data: agent, error: agentError } = await supabase
      .from('agent_versions')
      .select('*')
      .eq('id', agentVersionId)
      .single();

    if (agentError) {
      throw new Error(`Agent version not found: ${agentError.message}`);
    }
    if (!agent) {
      throw new Error(`Agent version ${agentVersionId} not found`);
    }

    // Get vote statistics
    const upvotes = agent.upvotes || 0;
    const downvotes = agent.downvotes || 0;
    const totalVotes = upvotes + downvotes;
    const upvoteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
    
    // Get execution statistics with error handling
    let successCount = 0;
    let failureCount = 0;
    
    try {
      const { data: execStats, error: execError } = await supabase
        .from('plugin_logs')
        .select('status, count')
        .eq('agent_version_id', agentVersionId)
        .eq('tenant_id', tenantId)
        .group('status')
        .count();
      
      if (!execError && execStats) {
        successCount = execStats.find(s => s.status === 'success')?.count || 0;
        failureCount = execStats.find(s => s.status === 'failure')?.count || 0;
      } else {
        logStep(`Warning: Could not fetch execution stats: ${execError?.message}`);
      }
    } catch (error) {
      logStep(`Error fetching execution stats: ${error.message}`);
      // Continue without execution stats
    }
    
    const totalExecutions = successCount + failureCount;
    const successRate = totalExecutions > 0 ? successCount / totalExecutions : 0;
    const xp = agent.xp || 0;
    
    // Evaluate against criteria
    const hasEnoughVotes = totalVotes >= criteria.minimumVotes;
    const hasGoodUpvoteRatio = upvoteRatio >= criteria.minimumUpvoteRatio;
    const hasEnoughExecutions = totalExecutions >= criteria.minimumExecutions;
    const hasGoodSuccessRate = !hasEnoughExecutions || successRate >= criteria.minimumSuccessRate;
    const hasEnoughXp = xp >= criteria.minimumXp;
    
    // Decision and reason
    const shouldEvolve = 
      hasEnoughVotes && 
      hasGoodUpvoteRatio && 
      hasEnoughXp && 
      hasGoodSuccessRate;
    
    let reason = shouldEvolve 
      ? 'Agent meets evolution criteria' 
      : 'Agent does not meet evolution criteria';
    
    // Add specific reason for not evolving
    if (!shouldEvolve) {
      if (!hasEnoughVotes) reason += ': insufficient votes';
      else if (!hasGoodUpvoteRatio) reason += ': insufficient upvote ratio';
      else if (!hasEnoughXp) reason += ': insufficient XP';
      else if (hasEnoughExecutions && !hasGoodSuccessRate) reason += ': poor success rate';
    }
    
    logStep(`Evolution check result for ${agentVersionId}`, { 
      shouldEvolve, 
      reason,
      votes: { total: totalVotes, ratio: upvoteRatio },
      executions: { total: totalExecutions, rate: successRate },
      xp
    });

    return {
      shouldEvolve,
      votes: { up: upvotes, down: downvotes, total: totalVotes, ratio: upvoteRatio },
      executions: { success: successCount, failure: failureCount, total: totalExecutions, rate: successRate },
      xp,
      reason
    };
  } catch (error: any) {
    logStep(`Error checking agent ${agentVersionId} evolution status: ${error.message}`);
    throw error;
  }
}

/**
 * Evolve an agent to a new version based on feedback and performance
 * @param supabase Supabase client
 * @param agentVersionId Agent version to evolve
 * @param tenantId Tenant ID
 */
async function evolveAgent(
  supabase: any,
  agentVersionId: string,
  tenantId: string
): Promise<{
  success: boolean;
  message: string;
  newAgentId?: string;
  newVersion?: string;
  error?: string;
}> {
  try {
    logStep(`Starting evolution for agent ${agentVersionId}`);
    
    // Step 1: Get current agent version details with retry logic
    let currentAgent;
    let getAgentAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    while (getAgentAttempts < MAX_ATTEMPTS) {
      try {
        const { data, error } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('id', agentVersionId)
          .single();
          
        if (error) throw new Error(`Failed to fetch agent: ${error.message}`);
        if (!data) throw new Error('Agent not found');
        
        currentAgent = data;
        break;
      } catch (err) {
        getAgentAttempts++;
        if (getAgentAttempts >= MAX_ATTEMPTS) throw err;
        await new Promise(r => setTimeout(r, 500 * getAgentAttempts));
      }
    }

    // Step 2: Get feedback from votes with error handling
    let votes = [];
    try {
      const { data: voteData, error: votesError } = await supabase
        .from('agent_votes')
        .select('comment, vote_type')
        .eq('agent_version_id', agentVersionId)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!votesError && voteData) {
        votes = voteData;
      } else {
        logStep(`Warning: Could not fetch agent votes: ${votesError?.message}`);
      }
    } catch (error) {
      logStep(`Error fetching votes: ${error.message}`);
      // Continue without votes
    }

    // Step 3: Generate new version with proper semantic versioning
    const currentVersion = currentAgent.version || '1.0.0';
    let newVersion;
    
    try {
      const versionParts = currentVersion.split('.');
      // Ensure we have a valid version with at least 3 parts
      if (versionParts.length < 3) {
        versionParts.push('0'); // Add patch version if missing
      }
      newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2] || '0') + 1}`;
    } catch (versionError) {
      // Fallback if version parsing fails
      newVersion = `${currentVersion}-evolved`;
      logStep(`Warning: Version parsing failed, using fallback: ${newVersion}`);
    }

    // Step 4: Generate improved prompt based on feedback
    const positiveComments = votes
      ?.filter(v => v.vote_type === 'up' && v.comment)
      .map(v => v.comment)
      .join('\n') || '';
      
    const negativeComments = votes
      ?.filter(v => v.vote_type === 'down' && v.comment)
      .map(v => v.comment)
      .join('\n') || '';
    
    const evolutionTimestamp = new Date().toISOString();
    const improvedPrompt = `${currentAgent.prompt}\n\n/* Auto-evolved from version ${currentVersion} to ${newVersion} at ${evolutionTimestamp} */\n\n` +
      (positiveComments ? `Positive feedback:\n${positiveComments}\n\n` : '') +
      (negativeComments ? `Areas for improvement:\n${negativeComments}\n\n` : '') +
      `This is an automatically evolved version of the agent based on user feedback and performance metrics.`;

    // Step 5: Insert new agent version with retry
    let newAgent;
    let insertAttempts = 0;
    
    while (insertAttempts < MAX_ATTEMPTS) {
      try {
        const { data, error } = await supabase
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
          
        if (error) throw new Error(`Failed to create new agent: ${error.message}`);
        if (!data) throw new Error('No data returned from insert');
        
        newAgent = data;
        break;
      } catch (err) {
        insertAttempts++;
        if (insertAttempts >= MAX_ATTEMPTS) throw err;
        await new Promise(r => setTimeout(r, 500 * insertAttempts));
      }
    }

    // Step 6: Update status of the old version
    let updateAttempts = 0;
    
    while (updateAttempts < MAX_ATTEMPTS) {
      try {
        const { error } = await supabase
          .from('agent_versions')
          .update({ status: 'deprecated' })
          .eq('id', agentVersionId);
          
        if (error) throw new Error(`Failed to update old agent: ${error.message}`);
        break;
      } catch (err) {
        updateAttempts++;
        if (updateAttempts >= MAX_ATTEMPTS) {
          // Log but continue - old version not being deprecated isn't critical
          logStep(`Warning: Failed to deprecate old agent after ${MAX_ATTEMPTS} attempts: ${err.message}`);
          break;
        }
        await new Promise(r => setTimeout(r, 500 * updateAttempts));
      }
    }

    // Step 7: Log the evolution event
    try {
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
            new_version: newVersion,
            positive_feedback_count: votes?.filter(v => v.vote_type === 'up' && v.comment).length || 0,
            negative_feedback_count: votes?.filter(v => v.vote_type === 'down' && v.comment).length || 0,
          }
        });
    } catch (logError) {
      logStep(`Warning: Failed to log evolution event: ${logError.message}`);
      // Continue despite logging failure
    }
    
    logStep(`Successfully evolved agent ${agentVersionId} to ${newAgent.id} (version ${newVersion})`);

    return {
      success: true,
      message: `Agent successfully evolved to version ${newVersion}`,
      newAgentId: newAgent.id,
      newVersion
    };
  } catch (error: any) {
    logStep(`Error evolving agent ${agentVersionId}: ${error.message}`);
    return {
      success: false,
      message: "Failed to evolve agent",
      error: error.message
    };
  }
}

/**
 * Check and evolve multiple agents for a tenant
 * @param supabase Supabase client
 * @param tenantId Optional tenant ID filter
 * @param criteria Evolution criteria
 */
async function checkAndEvolveAgents(
  supabase: any,
  tenantId?: string,
  criteria: EvolutionCriteria = DEFAULT_CRITERIA
): Promise<{
  success: boolean;
  evolved: { agent_id: string; new_agent_id: string; version: string; new_version: string }[];
  errors: { agent_id: string; error: string }[];
}> {
  const evolved: { agent_id: string; new_agent_id: string; version: string; new_version: string }[] = [];
  const errors: { agent_id: string; error: string }[] = [];

  try {
    logStep(`Starting batch evolution check${tenantId ? ` for tenant ${tenantId}` : ''}`);
    
    // Step 1: Get all active agent versions
    let query = supabase
      .from('agent_versions')
      .select('id, plugin_id, version')
      .eq('status', 'active');
      
    if (tenantId) {
      // If tenant ID provided, filter by plugins for that tenant
      // using a subquery - this is more efficient than joining
      logStep(`Filtering agents for tenant ${tenantId}`);
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

    // Step 2: Process each agent with a retry mechanism
    for (const agent of activeAgents) {
      try {
        // Use the tenant_id from the agent's plugin if available
        const agentTenantId = tenantId || 'system';
        
        // Check if the agent should be evolved
        const evolutionStatus = await checkAgentEvolutionStatus(
          supabase, 
          agent.id, 
          agentTenantId, 
          criteria
        );
        
        logStep(`Agent ${agent.id} evolution check result`, { 
          shouldEvolve: evolutionStatus.shouldEvolve, 
          reason: evolutionStatus.reason 
        });
        
        // If it meets criteria, evolve it
        if (evolutionStatus.shouldEvolve) {
          const result = await evolveAgent(supabase, agent.id, agentTenantId);
          
          if (result.success && result.newAgentId && result.newVersion) {
            evolved.push({
              agent_id: agent.id,
              new_agent_id: result.newAgentId,
              version: agent.version || 'unknown',
              new_version: result.newVersion
            });
            
            logStep(`Successfully evolved agent ${agent.id} to ${result.newVersion}`);
          } else {
            errors.push({
              agent_id: agent.id,
              error: result.error || "Unknown error during evolution"
            });
            
            logStep(`Failed to evolve agent ${agent.id}: ${result.error}`);
          }
        } else {
          logStep(`Agent ${agent.id} does not need evolution: ${evolutionStatus.reason}`);
        }
      } catch (agentError: any) {
        const errorMessage = `Error processing agent ${agent.id}: ${agentError.message}`;
        errors.push({
          agent_id: agent.id,
          error: errorMessage
        });
        
        logStep(`Error processing agent ${agent.id}`, { error: agentError.message });
      }
    }

    logStep("Evolution process complete", { 
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

// Main handler with comprehensive error handling
serve(async (req) => {
  const startTime = performance.now();
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    logStep("Starting autoEvolveAgents function");
    
    // Get Supabase credentials with fallbacks
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required Supabase credentials");
    }
    
    // Create Supabase client
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      logStep("Supabase client created successfully");
    } catch (clientError) {
      throw new Error(`Failed to create Supabase client: ${clientError.message}`);
    }
    
    // Parse request body if present with validation
    let tenantId: string | undefined = undefined;
    let criteria = DEFAULT_CRITERIA;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        
        // Validate tenant_id if present
        if (body.tenant_id !== undefined) {
          if (typeof body.tenant_id !== 'string') {
            return new Response(JSON.stringify({ 
              success: false,
              error: "Invalid tenant_id format" 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          tenantId = body.tenant_id;
        }
        
        // Validate and apply custom criteria if present
        if (body.criteria) {
          if (typeof body.criteria !== 'object') {
            return new Response(JSON.stringify({ 
              success: false,
              error: "Invalid criteria format"
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Merge with default criteria, validating each field
          criteria = {
            ...DEFAULT_CRITERIA,
            minimumVotes: typeof body.criteria.minimumVotes === 'number' ? 
              body.criteria.minimumVotes : DEFAULT_CRITERIA.minimumVotes,
            minimumUpvoteRatio: typeof body.criteria.minimumUpvoteRatio === 'number' ? 
              body.criteria.minimumUpvoteRatio : DEFAULT_CRITERIA.minimumUpvoteRatio,
            minimumExecutions: typeof body.criteria.minimumExecutions === 'number' ? 
              body.criteria.minimumExecutions : DEFAULT_CRITERIA.minimumExecutions,
            minimumSuccessRate: typeof body.criteria.minimumSuccessRate === 'number' ? 
              body.criteria.minimumSuccessRate : DEFAULT_CRITERIA.minimumSuccessRate,
            minimumXp: typeof body.criteria.minimumXp === 'number' ? 
              body.criteria.minimumXp : DEFAULT_CRITERIA.minimumXp
          };
        }
      } catch (e) {
        // If parsing fails, use default values but don't fail completely
        logStep("Warning: Invalid request body, using defaults", { error: e.message });
      }
    }
    
    logStep("Using configuration", { 
      tenantId: tenantId || "all tenants",
      criteria
    });
    
    // Run the evolution process
    const result = await checkAndEvolveAgents(supabase, tenantId, criteria);
    
    // Add execution time
    const executionTime = (performance.now() - startTime) / 1000;
    const response = {
      ...result,
      execution_time: executionTime
    };
    
    logStep(`Finished auto-evolution successfully in ${executionTime.toFixed(2)}s`);
    
    // Return the result
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`Critical error: ${errorMessage}`);
    
    const executionTime = (performance.now() - startTime) / 1000;
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      execution_time: executionTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
