
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Track timing for performance logging
  const startTime = performance.now();
  let executionId: string | null = null;
  
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: String(parseError)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const { strategy_id, tenant_id, user_id } = body;
    
    // Validate required parameters
    if (!strategy_id) {
      return new Response(
        JSON.stringify({ error: "Strategy ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "Tenant ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        global: { 
          headers: { Authorization: req.headers.get("Authorization") || "" } 
        },
      }
    );

    // Create execution record first to track this process
    try {
      const { data: execution, error: executionError } = await supabaseAdmin
        .from("executions")
        .insert({
          tenant_id: tenant_id,
          strategy_id,
          executed_by: user_id,
          type: 'strategy',
          status: 'pending',
          input: { strategy_id, tenant_id }
        })
        .select()
        .single();
        
      if (executionError) {
        console.error("Error creating execution record, but continuing:", executionError);
      } else {
        executionId = execution?.id;
      }
    } catch (error) {
      console.error("Failed to create execution record, but continuing:", error);
    }
    
    // Get the strategy
    let strategy;
    try {
      const { data, error: strategyError } = await supabaseAdmin
        .from("strategies")
        .select("*, plugins(id, name)")
        .eq("id", strategy_id)
        .single();

      if (strategyError || !data) {
        // Update execution if we have an ID
        if (executionId) {
          await supabaseAdmin
            .from("executions")
            .update({
              status: "failure",
              error: "Strategy not found",
              updated_at: new Date().toISOString()
            })
            .eq("id", executionId);
        }
        
        return new Response(
          JSON.stringify({ error: "Strategy not found", details: strategyError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      strategy = data;
      
      // Verify tenant access
      if (strategy.tenant_id !== tenant_id) {
        // Update execution if we have an ID
        if (executionId) {
          await supabaseAdmin
            .from("executions")
            .update({
              status: "failure",
              error: "Strategy does not belong to the specified tenant",
              updated_at: new Date().toISOString()
            })
            .eq("id", executionId);
        }
        
        return new Response(
          JSON.stringify({ error: "Access denied: Strategy does not belong to your tenant" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    } catch (error) {
      console.error("Error fetching strategy:", error);
      
      // Update execution if we have an ID
      if (executionId) {
        await supabaseAdmin
          .from("executions")
          .update({
            status: "failure",
            error: String(error),
            updated_at: new Date().toISOString()
          })
          .eq("id", executionId);
      }
      
      return new Response(
        JSON.stringify({ error: "Error fetching strategy", details: String(error) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get associated plugins for this strategy via plugin_logs
    let pluginLogs;
    try {
      const { data, error: pluginLogsError } = await supabaseAdmin
        .from("plugin_logs")
        .select("*, plugins(*), agent_versions(*)")
        .eq("strategy_id", strategy_id);
      
      if (pluginLogsError) {
        console.error("Error loading plugin logs, but continuing:", pluginLogsError);
      } else {
        pluginLogs = data || [];
      }
    } catch (error) {
      console.error("Error fetching plugin logs, but continuing:", error);
      pluginLogs = [];
    }
    
    // For each plugin log, update status and execute
    let successCount = 0;
    let totalPlugins = pluginLogs?.length || 0;
    let errors = [];
    
    // Process plugins in series to maintain order and prevent race conditions
    for (const log of pluginLogs || []) {
      try {
        // Mark log as processing
        await supabaseAdmin
          .from("plugin_logs")
          .update({
            status: "pending",
            updated_at: new Date().toISOString()
          })
          .eq("id", log.id);
          
        // Get agent version
        const agentVersion = log.agent_versions;
        
        if (!agentVersion) {
          throw new Error("Agent version not found");
        }
        
        // In a real implementation, this would call an AI service
        // Here we're simulating a plugin execution
        const startTime = performance.now();
        const randomSuccess = Math.random() > 0.2; // 80% success rate
        const executionTime = Math.random() * 2.5 + 0.5; // 0.5 to 3 seconds
        const xpEarned = Math.floor(Math.random() * 15) + 5; // 5 to 20 XP
        
        // Wait to simulate processing time
        await new Promise(resolve => setTimeout(resolve, executionTime * 1000));
        
        if (!randomSuccess) {
          throw new Error(`Plugin execution failed for ${log.plugins?.name || 'unknown plugin'}`);
        }
        
        const pluginResult = {
          output: {
            result: `Generated content for ${strategy.title} using ${log.plugins?.name || 'plugin'}`,
            metadata: {
              strategyId: strategy.id,
              pluginId: log.plugin_id,
              agentVersionId: log.agent_version_id
            }
          }
        };
        
        // Update the plugin log
        await supabaseAdmin
          .from("plugin_logs")
          .update({
            status: "success",
            output: pluginResult.output,
            execution_time: executionTime,
            xp_earned: xpEarned,
            updated_at: new Date().toISOString()
          })
          .eq("id", log.id);
          
        // Update plugin XP
        if (log.plugin_id) {
          try {
            const { data: plugin } = await supabaseAdmin
              .from("plugins")
              .select("xp")
              .eq("id", log.plugin_id)
              .single();
              
            if (plugin) {
              await supabaseAdmin
                .from("plugins")
                .update({ 
                  xp: plugin.xp + xpEarned,
                  updated_at: new Date().toISOString()
                })
                .eq("id", log.plugin_id);
            }
          } catch (error) {
            console.error("Error updating plugin XP, but continuing:", error);
          }
        }
        
        // Update agent version XP
        if (log.agent_version_id) {
          try {
            const { data: agent } = await supabaseAdmin
              .from("agent_versions")
              .select("xp")
              .eq("id", log.agent_version_id)
              .single();
              
            if (agent) {
              await supabaseAdmin
                .from("agent_versions")
                .update({ 
                  xp: agent.xp + xpEarned,
                  updated_at: new Date().toISOString()
                })
                .eq("id", log.agent_version_id);
            }
          } catch (error) {
            console.error("Error updating agent XP, but continuing:", error);
          }
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error executing plugin ${log.plugins?.name || 'unknown'}:`, error);
        
        // Track errors for reporting
        errors.push({
          plugin_name: log.plugins?.name || 'unknown',
          error: String(error)
        });
        
        // Update the plugin log with error
        try {
          await supabaseAdmin
            .from("plugin_logs")
            .update({
              status: "failure",
              error: String(error),
              execution_time: Math.random() * 1.5, // Mock failed execution time
              updated_at: new Date().toISOString()
            })
            .eq("id", log.id);
        } catch (updateError) {
          console.error("Error updating plugin log status, continuing:", updateError);
        }
      }
    }
    
    // Calculate completion percentage
    const completionPercentage = totalPlugins > 0 
      ? Math.round((successCount / totalPlugins) * 100)
      : 100;
    
    // Update strategy status and completion
    try {
      await supabaseAdmin
        .from("strategies")
        .update({ 
          status: "completed",
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString() 
        })
        .eq("id", strategy_id);
    } catch (error) {
      console.error("Error updating strategy status, but continuing:", error);
    }
    
    // Update execution status
    if (executionId) {
      try {
        await supabaseAdmin
          .from("executions")
          .update({
            status: errors.length > 0 ? (successCount > 0 ? "partial" : "failure") : "success",
            output: { 
              success: errors.length === 0,
              completion_percentage: completionPercentage,
              plugins_executed: totalPlugins,
              plugins_succeeded: successCount,
              errors: errors.length > 0 ? errors : undefined
            },
            execution_time: performance.now() - startTime,
            updated_at: new Date().toISOString()
          })
          .eq("id", executionId);
      } catch (error) {
        console.error("Error updating execution record, but continuing:", error);
      }
    }
    
    // Log completion to system logs
    try {
      await supabaseAdmin
        .from("system_logs")
        .insert({
          tenant_id,
          module: "strategy",
          event: errors.length > 0 ? "strategy_execution_partial" : "strategy_execution_complete",
          context: {
            strategy_id,
            execution_id: executionId,
            completion_percentage: completionPercentage,
            plugins_succeeded: successCount,
            plugins_failed: totalPlugins - successCount,
            execution_time: performance.now() - startTime
          }
        });
    } catch (error) {
      console.error("Error logging to system logs, but continuing:", error);
    }
    
    // Return success response with details
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: errors.length > 0 
          ? `Strategy execution completed with ${totalPlugins - successCount} errors` 
          : "Strategy executed successfully",
        completion_percentage: completionPercentage,
        plugins_executed: totalPlugins,
        plugins_succeeded: successCount,
        plugins_failed: totalPlugins - successCount,
        execution_time: performance.now() - startTime,
        execution_id: executionId,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error executing strategy:", error);
    
    // Update execution if we have an ID
    if (executionId) {
      try {
        const supabaseAdmin = createClient(
          getEnv("SUPABASE_URL"),
          getEnv("SUPABASE_SERVICE_ROLE_KEY")
        );
        
        await supabaseAdmin
          .from("executions")
          .update({
            status: "failure",
            error: String(error),
            execution_time: performance.now() - startTime,
            updated_at: new Date().toISOString()
          })
          .eq("id", executionId);
      } catch (updateError) {
        console.error("Failed to update execution record after error:", updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: String(error),
        execution_id: executionId
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
