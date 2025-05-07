
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Helper function to safely get environment variables
function getEnvVar(name: string, fallback: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof globalThis.Deno !== 'undefined') {
      return globalThis.Deno.env.get(name) || fallback;
    }
    // Fallback to process.env for Node environment
    return process.env[name] || fallback;
  } catch (error) {
    // If all else fails, return the fallback
    console.warn(`Error accessing env var ${name}:`, error);
    return fallback;
  }
}

// Define the Supabase client
const supabaseUrl = getEnvVar("SUPABASE_URL", "https://ijrnwpgsqsxzqdemtknz.supabase.co");
const supabaseAnonKey = getEnvVar("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo");
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY", "");

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define XP thresholds for promotion
const XP_PROMOTION_THRESHOLD = 1000;
const MODULE_NAME = "autoEvolveAgents";

// Input validation schema
const inputSchema = {
  validate(input: any): { valid: boolean; error?: string } {
    // Check if tenant_id exists when provided in the request
    if (input && input.tenant_id !== undefined) {
      if (typeof input.tenant_id !== 'string' || input.tenant_id.length < 5) {
        return { valid: false, error: "Invalid tenant_id format" };
      }
    }
    
    // Check if custom_threshold is a number when provided
    if (input && input.custom_threshold !== undefined) {
      if (typeof input.custom_threshold !== 'number' || input.custom_threshold < 0) {
        return { valid: false, error: "custom_threshold must be a positive number" };
      }
    }
    
    return { valid: true };
  }
};

serve(async (req) => {
  const startTime = performance.now();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed',
      execution_time: (performance.now() - startTime) / 1000 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  // Parse the request body
  let body;
  try {
    body = await req.json();
    console.log(`${MODULE_NAME}: Request received with payload:`, body);
    
    // Validate input
    const validation = inputSchema.validate(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validation.error,
        execution_time: (performance.now() - startTime) / 1000 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.log(`${MODULE_NAME}: Invalid request body`, error);
    body = {};
  }
  
  // Extract options from request
  const tenantFilter = body.tenant_id || null;
  const customThreshold = body.custom_threshold || XP_PROMOTION_THRESHOLD;

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    if (!supabaseServiceKey) {
      console.warn(`${MODULE_NAME}: No service role key provided. Using anon key with limited permissions.`);
    }

    // Log execution start
    console.log(`${MODULE_NAME}: Starting agent evolution check with threshold ${customThreshold}`);
    if (tenantFilter) {
      console.log(`${MODULE_NAME}: Filtering for tenant ${tenantFilter}`);
    }

    // Build query for agent versions that have reached the XP threshold but are still in training
    let query = supabase
      .from('agent_versions')
      .select('id, plugin_id, version, xp, tenant_id, plugins(name)')
      .eq('status', 'training')
      .gte('xp', customThreshold);
      
    // Add tenant filter if specified
    if (tenantFilter) {
      query = query.eq('tenant_id', tenantFilter);
    }
    
    // Execute the query
    const { data: agentsToPromote, error } = await query;
      
    if (error) {
      throw error;
    }
    
    // Count successful promotions
    let promotedCount = 0;
    const errors: string[] = [];
    const results: any[] = [];
    
    // Process each agent that needs promotion
    for (const agent of agentsToPromote || []) {
      try {
        console.log(`${MODULE_NAME}: Processing agent ${agent.id} for plugin ${agent.plugin_id} (v${agent.version}) with XP ${agent.xp}`);
        
        // Update the agent status to active
        const { error: updateError } = await supabase
          .from('agent_versions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.id);
          
        if (updateError) {
          throw updateError;
        }

        // Check if there's a previous active version that needs to be deprecated
        const { data: activeVersions, error: activeError } = await supabase
          .from('agent_versions')
          .select('id, version')
          .eq('plugin_id', agent.plugin_id)
          .eq('status', 'active')
          .neq('id', agent.id);

        if (activeError) {
          console.warn(`${MODULE_NAME}: Error checking for active versions:`, activeError);
        } else if (activeVersions && activeVersions.length > 0) {
          // Deprecate all previous active versions
          const deprecationIds = activeVersions.map(v => v.id);
          console.log(`${MODULE_NAME}: Deprecating previous versions:`, deprecationIds);
          
          const { error: deprecateError } = await supabase
            .from('agent_versions')
            .update({
              status: 'deprecated',
              updated_at: new Date().toISOString()
            })
            .in('id', deprecationIds);
            
          if (deprecateError) {
            console.warn(`${MODULE_NAME}: Error deprecating previous versions:`, deprecateError);
          }
        }
        
        // Log the promotion event
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: agent.tenant_id,
            module: 'agents',
            event: 'agent_promoted',
            context: {
              agent_version_id: agent.id,
              plugin_id: agent.plugin_id,
              plugin_name: agent.plugins?.name,
              version: agent.version,
              xp: agent.xp,
              threshold: customThreshold,
              previous_active_versions: activeVersions || []
            }
          });
        
        results.push({
          id: agent.id,
          plugin_id: agent.plugin_id,
          plugin_name: agent.plugins?.name,
          version: agent.version,
          xp: agent.xp,
          promoted: true
        });
        
        promotedCount++;
        console.log(`${MODULE_NAME}: Successfully promoted agent ${agent.id} to active`);
      } catch (agentError: any) {
        errors.push(`Failed to promote agent ${agent.id}: ${agentError.message}`);
        console.error(`${MODULE_NAME}: Error promoting agent ${agent.id}:`, agentError);
        
        results.push({
          id: agent.id,
          plugin_id: agent.plugin_id,
          plugin_name: agent.plugins?.name,
          version: agent.version,
          xp: agent.xp,
          promoted: false,
          error: agentError.message
        });
        
        // Log the error
        try {
          await supabase
            .from('system_logs')
            .insert({
              tenant_id: agent.tenant_id || 'system',
              module: 'agents',
              event: 'agent_promotion_failed',
              context: {
                agent_version_id: agent.id,
                plugin_id: agent.plugin_id,
                version: agent.version,
                error: agentError.message
              }
            });
        } catch (logError) {
          console.error(`${MODULE_NAME}: Failed to log error:`, logError);
        }
      }
    }
    
    // Log final execution summary
    const executionTime = (performance.now() - startTime) / 1000;
    console.log(`${MODULE_NAME}: Completed in ${executionTime.toFixed(2)}s. Promoted ${promotedCount} agents out of ${agentsToPromote?.length || 0} eligible`);
    
    // Log execution summary to system_logs
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantFilter || 'system',
          module: 'agents',
          event: 'auto_evolve_executed',
          context: {
            eligible_count: agentsToPromote?.length || 0,
            promoted_count: promotedCount,
            threshold: customThreshold,
            execution_time: executionTime,
            has_errors: errors.length > 0
          }
        });
    } catch (logError) {
      console.error(`${MODULE_NAME}: Failed to log execution summary:`, logError);
    }
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      promoted_count: promotedCount,
      total_eligible: agentsToPromote?.length || 0,
      execution_time: executionTime,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    // Log error
    console.error(`${MODULE_NAME}: Error in autoEvolveAgents:`, error);
    const executionTime = (performance.now() - startTime) / 1000;
    
    // Try to log the error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantFilter || 'system',
          module: 'agents',
          event: 'auto_evolve_error',
          context: {
            error: error.message,
            execution_time: executionTime
          }
        });
    } catch (logError) {
      console.error(`${MODULE_NAME}: Failed to log error:`, logError);
    }
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      execution_time: executionTime,
      promoted_count: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
