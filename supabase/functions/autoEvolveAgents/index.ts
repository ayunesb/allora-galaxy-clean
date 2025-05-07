
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    return typeof Deno !== "undefined" && Deno.env 
      ? Deno.env.get(name) ?? fallback
      : fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input schema for autoEvolveAgents
const autoEvolveSchema = z.object({
  tenant_id: z.string().uuid().optional(),
  check_all_tenants: z.boolean().optional().default(false),
  min_xp_threshold: z.number().optional().default(1000),
  min_upvotes: z.number().optional().default(5),
  requires_approval: z.boolean().optional().default(true),
  run_mode: z.enum(['manual', 'cron']).optional().default('manual')
});

interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  status: string;
  xp: number;
  upvotes: number;
  downvotes: number;
  plugins?: {
    name: string;
    id: string;
    tenant_id: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing Supabase credentials",
        details: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Parse request body
    let payload;
    try {
      const body = await req.json();
      const result = autoEvolveSchema.safeParse(body);
      
      if (!result.success) {
        const errorMessage = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        console.error(`Invalid request payload: ${errorMessage}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Invalid request payload: ${errorMessage}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      payload = result.data;
    } catch (parseError) {
      // Default values if no body provided
      payload = {
        check_all_tenants: false,
        min_xp_threshold: 1000,
        min_upvotes: 5,
        requires_approval: true,
        run_mode: 'cron'
      };
      console.log("No request body provided, using defaults");
    }
    
    const {
      tenant_id,
      check_all_tenants,
      min_xp_threshold,
      min_upvotes,
      requires_approval,
      run_mode
    } = payload;

    // Process either a specific tenant or all tenants
    if (tenant_id) {
      // Verify the tenant exists
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', tenant_id)
        .maybeSingle();
        
      if (tenantError) {
        throw new Error(`Failed to verify tenant: ${tenantError.message}`);
      }
      
      if (!tenant) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Tenant with ID ${tenant_id} not found`
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      // Process this specific tenant
      const result = await processAgentsForTenant(
        supabase,
        tenant_id,
        min_xp_threshold,
        min_upvotes,
        requires_approval,
        run_mode
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          tenant_id: tenant_id,
          tenant_name: tenant.name,
          ...result,
          execution_time: (performance.now() - startTime) / 1000
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else if (check_all_tenants) {
      // Get all tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name');
        
      if (tenantsError) {
        throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
      }
      
      if (!tenants || tenants.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "No tenants found to process",
            execution_time: (performance.now() - startTime) / 1000
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      // Process each tenant
      const results = {};
      let totalEligible = 0;
      let totalReady = 0;
      
      for (const tenant of tenants) {
        try {
          const tenantResult = await processAgentsForTenant(
            supabase,
            tenant.id,
            min_xp_threshold,
            min_upvotes,
            requires_approval,
            run_mode
          );
          
          results[tenant.id] = {
            tenant_name: tenant.name,
            ...tenantResult
          };
          
          totalEligible += tenantResult.eligible_count || 0;
          totalReady += tenantResult.ready_for_approval || 0;
        } catch (tenantError) {
          console.error(`Error processing tenant ${tenant.name}:`, tenantError);
          results[tenant.id] = {
            tenant_name: tenant.name,
            success: false,
            error: String(tenantError)
          };
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed agents for ${tenants.length} tenants`,
          summary: {
            tenant_count: tenants.length,
            total_eligible_agents: totalEligible,
            total_ready_for_approval: totalReady
          },
          results,
          execution_time: (performance.now() - startTime) / 1000
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Either tenant_id or check_all_tenants must be provided"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error processing auto evolve agents request:", error);
    
    // Try to log the error
    try {
      if (supabaseUrl && supabaseServiceRoleKey) {
        const logSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        await logSupabase
          .from('system_logs')
          .insert({
            tenant_id: 'system',
            module: 'agents',
            event: 'auto_evolve_error',
            context: { error: String(error) }
          });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process auto evolve agents request",
        details: String(error),
        execution_time: (performance.now() - startTime) / 1000
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

/**
 * Process agent evolution for a specific tenant
 */
async function processAgentsForTenant(
  supabase,
  tenant_id: string,
  min_xp_threshold: number,
  min_upvotes: number,
  requires_approval: boolean,
  run_mode: string
) {
  // Log the agent evolution check in system logs
  await supabase
    .from('system_logs')
    .insert({
      tenant_id,
      module: 'agents',
      event: 'auto_evolve_check_started',
      context: { 
        min_xp_threshold,
        min_upvotes,
        requires_approval,
        run_mode
      }
    });
  
  // Find eligible agents
  const { data: eligibleAgents } = await supabase
    .from('agent_versions')
    .select(`
      id,
      plugin_id,
      version,
      status,
      xp,
      upvotes,
      downvotes,
      plugins:plugin_id (
        name,
        id,
        tenant_id
      )
    `)
    .eq('status', 'training')
    .gte('xp', min_xp_threshold)
    .gte('upvotes', min_upvotes);
  
  const tenantAgents = (eligibleAgents || []).filter(
    agent => agent.plugins?.tenant_id === tenant_id
  );
  
  if (!tenantAgents || tenantAgents.length === 0) {
    // Log that no eligible agents were found for this tenant
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        module: 'agents',
        event: 'no_eligible_agents',
        context: { 
          min_xp_threshold,
          min_upvotes,
          message: 'No eligible agents found for evolution' 
        }
      });
      
    return {
      success: true,
      message: 'No agents eligible for evolution',
      eligible_count: 0,
      ready_for_approval: 0
    };
  }
  
  // Log the eligible agents found
  await supabase
    .from('system_logs')
    .insert({
      tenant_id,
      module: 'agents',
      event: 'eligible_agents_found',
      context: {
        count: tenantAgents.length,
        agent_ids: tenantAgents.map(a => a.id)
      }
    });
  
  // For each eligible agent, check if it should be evolved
  const readyForPromotion = [];
  
  for (const agent of tenantAgents) {
    try {
      if (requires_approval) {
        // If approval is required, just mark it as ready
        readyForPromotion.push(agent);
        
        // Log that it's ready for approval
        await supabase
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'agents',
            event: 'agent_ready_for_approval',
            context: {
              agent_version_id: agent.id,
              plugin_id: agent.plugin_id,
              plugin_name: agent.plugins?.name,
              xp: agent.xp,
              upvotes: agent.upvotes
            }
          });
      } else {
        // If no approval required, evolve immediately
        const { error: updateError } = await supabase
          .from('agent_versions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.id);
          
        if (updateError) {
          throw new Error(`Failed to promote agent: ${updateError.message}`);
        }
        
        // Find and deprecate any previous active versions
        const { data: activeVersions } = await supabase
          .from('agent_versions')
          .select('id')
          .eq('plugin_id', agent.plugin_id)
          .eq('status', 'active')
          .neq('id', agent.id);
          
        if (activeVersions && activeVersions.length > 0) {
          const deprecateIds = activeVersions.map(v => v.id);
          
          await supabase
            .from('agent_versions')
            .update({
              status: 'deprecated',
              updated_at: new Date().toISOString()
            })
            .in('id', deprecateIds);
        }
        
        // Log the promotion
        await supabase
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'agents',
            event: 'agent_auto_promoted',
            context: {
              agent_version_id: agent.id,
              plugin_id: agent.plugin_id,
              plugin_name: agent.plugins?.name,
              version: agent.version,
              xp: agent.xp,
              upvotes: agent.upvotes,
              deprecated_count: activeVersions?.length || 0
            }
          });
      }
    } catch (agentError) {
      console.error(`Error processing agent ${agent.id}:`, agentError);
      
      // Log the error
      await supabase
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'agents',
          event: 'agent_evolution_error',
          context: {
            agent_version_id: agent.id,
            plugin_id: agent.plugin_id,
            plugin_name: agent.plugins?.name,
            error: String(agentError)
          }
        });
    }
  }
  
  // Log completion
  await supabase
    .from('system_logs')
    .insert({
      tenant_id,
      module: 'agents',
      event: 'auto_evolve_check_completed',
      context: {
        eligible_count: tenantAgents.length,
        ready_for_approval: requires_approval ? readyForPromotion.length : 0,
        auto_promoted: !requires_approval ? readyForPromotion.length : 0
      }
    });
  
  return {
    success: true,
    message: requires_approval 
      ? `${readyForPromotion.length} agents ready for approval`
      : `${readyForPromotion.length} agents automatically promoted`,
    eligible_count: tenantAgents.length,
    ready_for_approval: requires_approval ? readyForPromotion.length : 0,
    auto_promoted: !requires_approval ? readyForPromotion.length : 0,
    agents: readyForPromotion.map(agent => ({
      id: agent.id,
      plugin_id: agent.plugin_id,
      plugin_name: agent.plugins?.name,
      version: agent.version,
      xp: agent.xp,
      upvotes: agent.upvotes
    }))
  };
}
