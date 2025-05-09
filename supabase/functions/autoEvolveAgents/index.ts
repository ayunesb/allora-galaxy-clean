
// Supabase Edge Function to automatically evolve agents based on performance
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Safely get environment variables
function safeGetDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    return Deno.env.get(key) ?? defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

// Configuration for agent evolution
const CONFIG = {
  evolutionThreshold: 0.7, // Minimum score to trigger evolution (0-1)
  minimumExecutions: 10, // Minimum number of executions before considering evolution
  failureRateThreshold: 0.2, // Trigger evolution if failure rate exceeds this
  staleDays: 30, // Days after which to consider an agent "stale"
  batchSize: 10 // Max number of agents to process in one run
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { tenant_id, options } = await req.json();
    
    // Get Supabase credentials
    const SUPABASE_URL = safeGetDenoEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = safeGetDenoEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Required environment variables are not configured"
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Merge config with any provided options
    const config = {
      ...CONFIG,
      ...(options || {})
    };
    
    // Log start of evolution process
    await logSystemEvent(supabase, 'agent', 'auto_evolve_started', {
      tenant_id,
      config
    }, tenant_id);
    
    // 1. Get agents that meet criteria for evolution
    const agents = await getAgentsForEvolution(supabase, tenant_id, config);
    console.log(`Found ${agents.length} agents to check for evolution`);
    
    let evolvedCount = 0;
    const evolvedAgents = [];
    
    // 2. Process each agent
    for (const agent of agents) {
      try {
        // Get usage statistics
        const stats = await getAgentStats(supabase, agent.id);
        
        // Calculate performance score
        const performance = calculatePerformance(stats);
        
        // Check if agent needs evolution
        if (performance < config.evolutionThreshold || 
            hasHighFailureRate(stats, config.failureRateThreshold)) {
          
          // Get feedback for this agent
          const feedback = await getAgentFeedback(supabase, agent.id);
          
          // Generate evolved prompt based on feedback and performance
          const newPrompt = await evolvePrompt(agent.prompt, feedback, performance);
          
          // Only evolve if prompt actually changed
          if (newPrompt !== agent.prompt) {
            // Create new agent version
            const newAgent = await createEvolvedAgent(
              supabase, 
              tenant_id, 
              agent.plugin_id, 
              agent.id, 
              newPrompt
            );
            
            // Log the evolution
            await logSystemEvent(supabase, 'agent', 'agent_evolved', {
              old_agent_id: agent.id,
              new_agent_id: newAgent.id,
              plugin_id: agent.plugin_id,
              performance_score: performance,
              tenant_id
            }, tenant_id);
            
            evolvedAgents.push({
              id: newAgent.id,
              previousId: agent.id,
              performance
            });
            
            evolvedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing agent ${agent.id}:`, error);
      }
    }
    
    // Log completion
    await logSystemEvent(supabase, 'agent', 'auto_evolve_completed', {
      agents_processed: agents.length,
      agents_evolved: evolvedCount,
      tenant_id
    }, tenant_id);
    
    // Return results
    return new Response(JSON.stringify({
      success: true,
      evolved: evolvedCount,
      agents: evolvedAgents,
      message: evolvedCount > 0 
        ? `Successfully evolved ${evolvedCount} agents` 
        : 'No agents needed evolution'
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
    
  } catch (error: any) {
    console.error("Error in autoEvolveAgents:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
      evolved: 0
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});

// Helper functions
async function getAgentsForEvolution(supabase: any, tenantId: string, config: any) {
  const query = supabase
    .from('agent_versions')
    .select(`
      id,
      plugin_id,
      version,
      prompt,
      created_at,
      tenant_id
    `)
    .eq('status', 'active');
    
  if (tenantId) {
    query.eq('tenant_id', tenantId);
  }
    
  query.limit(config.batchSize);
    
  const { data, error } = await query;
    
  if (error) throw error;
  return data || [];
}

async function getAgentStats(supabase: any, agentId: string) {
  const { data, error } = await supabase
    .from('plugin_logs')
    .select('status, execution_time, created_at')
    .eq('agent_version_id', agentId);
    
  if (error) throw error;
  return data || [];
}

function calculatePerformance(stats: any[]) {
  if (!stats || stats.length === 0) return 0.5; // Default neutral score
  
  const successCount = stats.filter(log => log.status === 'success').length;
  const totalCount = stats.length;
  
  // Simple success rate calculation
  return totalCount > 0 ? successCount / totalCount : 0.5;
}

function hasHighFailureRate(stats: any[], threshold: number) {
  if (!stats || stats.length < 10) return false; // Need minimum sample size
  
  const failureCount = stats.filter(log => log.status !== 'success').length;
  const totalCount = stats.length;
  
  return totalCount > 0 && (failureCount / totalCount) > threshold;
}

async function getAgentFeedback(supabase: any, agentId: string) {
  const { data, error } = await supabase
    .from('agent_votes')
    .select('comment, vote_type')
    .eq('agent_version_id', agentId)
    .not('comment', 'is', null);
    
  if (error) throw error;
  return data || [];
}

async function evolvePrompt(currentPrompt: string, feedback: any[], performance: number) {
  // In a real implementation, this would use LLM to improve the prompt
  // This is a placeholder that just adds feedback to the prompt
  if (feedback.length === 0) return currentPrompt;
  
  // Simple simulation of evolution - combine feedback into prompt
  const feedbackText = feedback
    .map(item => `${item.vote_type === 'upvote' ? 'Positive' : 'Negative'} feedback: ${item.comment}`)
    .join('\n');
    
  return `${currentPrompt}\n\n# Evolution Notes (Performance: ${performance.toFixed(2)}):\n${feedbackText}`;
}

async function createEvolvedAgent(
  supabase: any, 
  tenantId: string, 
  pluginId: string, 
  oldAgentId: string, 
  newPrompt: string
) {
  try {
    // 1. Get current version number
    const { data: versions } = await supabase
      .from('agent_versions')
      .select('version')
      .eq('plugin_id', pluginId);
    
    // Calculate next version
    let nextVersion = '1.0.0';
    if (versions && versions.length > 0) {
      const highestVersion = versions
        .map((v: any) => v.version)
        .sort((a: string, b: string) => {
          const aParts = a.split('.').map(Number);
          const bParts = b.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
          }
          return 0;
        })[0];
        
      const parts = highestVersion.split('.').map(Number);
      parts[2] += 1; // Increment patch version
      nextVersion = parts.join('.');
    }
    
    // 2. Mark old agent as inactive
    await supabase
      .from('agent_versions')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', oldAgentId);
    
    // 3. Create new agent version
    const { data, error } = await supabase
      .from('agent_versions')
      .insert({
        plugin_id: pluginId,
        version: nextVersion,
        prompt: newPrompt,
        status: 'active',
        tenant_id: tenantId,
        created_by: null, // System-generated
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating evolved agent:', error);
    throw error;
  }
}

async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context: Record<string, any>,
  tenantId?: string
) {
  try {
    await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        context,
        tenant_id: tenantId
      });
  } catch (error) {
    console.error('Error logging system event:', error);
    // Non-critical, continue execution
  }
}
