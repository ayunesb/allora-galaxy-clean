
// Edge function to execute strategies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExecuteRequest {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    
    const { strategy_id, tenant_id, user_id, options = {} } = body;
    
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

    // Create execution record to track this process
    try {
      const { data: execution, error: executionError } = await supabaseAdmin
        .from("executions")
        .insert({
          tenant_id: tenant_id,
          strategy_id,
          executed_by: user_id,
          type: 'strategy',
          status: 'pending',
          input: { strategy_id, tenant_id, options }
        })
        .select("id")
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
        .select("*, plugins(id, name, description, status)")
        .eq("id", strategy_id)
        .single();

      if (strategyError || !data) {
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
    
    // Get associated plugins for this strategy
    const plugins = strategy.plugins || [];
    const totalPlugins = plugins.length;
    
    if (totalPlugins === 0) {
      // No plugins to execute
      await supabaseAdmin
        .from("executions")
        .update({
          status: "success",
          output: { message: "Strategy has no plugins to execute" },
          execution_time: performance.now() - startTime,
          updated_at: new Date().toISOString()
        })
        .eq("id", executionId);
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Strategy has no plugins to execute",
          execution_id: executionId,
          execution_time: performance.now() - startTime
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process each plugin
    let successCount = 0;
    let errors = [];
    let pluginLogs = [];
    
    // Process plugins in series
    for (const plugin of plugins) {
      try {
        // Create a plugin log entry
        const { data: pluginLog, error: logError } = await supabaseAdmin
          .from("plugin_logs")
          .insert({
            plugin_id: plugin.id,
            strategy_id,
            tenant_id,
            status: "pending",
            execution_id: executionId,
            input: { strategy_id, plugin_id: plugin.id }
          })
          .select()
          .single();
          
        if (logError) {
          console.error("Error creating plugin log:", logError);
          throw new Error(`Failed to create plugin log: ${logError.message}`);
        }
        
        // Get the latest agent version for this plugin
        const { data: agentVersion, error: agentError } = await supabaseAdmin
          .from("agent_versions")
          .select("*")
          .eq("plugin_id", plugin.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (agentError) {
          console.warn(`No agent version found for plugin ${plugin.name}, continuing:`, agentError);
        }
        
        // Update plugin log with agent version if found
        if (agentVersion) {
          await supabaseAdmin
            .from("plugin_logs")
            .update({
              agent_version_id: agentVersion.id
            })
            .eq("id", pluginLog.id);
        }
          
        // Simulate plugin execution
        const executionTime = Math.random() * 2.5 + 0.5; // 0.5 to 3 seconds
        const xpEarned = Math.floor(Math.random() * 15) + 5; // 5 to 20 XP
        const randomSuccess = Math.random() > 0.2; // 80% success rate
        
        // Wait to simulate processing time
        await new Promise(resolve => setTimeout(resolve, executionTime * 1000));
        
        if (!randomSuccess) {
          throw new Error(`Plugin execution failed for ${plugin.name || 'unknown plugin'}`);
        }
        
        // Success path
        const pluginResult = {
          output: {
            result: `Generated content for ${strategy.title} using ${plugin.name || 'plugin'}`,
            metadata: {
              strategyId: strategy.id,
              pluginId: plugin.id,
              timestamp: new Date().toISOString()
            }
          },
          execution_time: executionTime,
          xp_earned: xpEarned,
          status: 'success'
        };
        
        // Update the plugin log with success
        await supabaseAdmin
          .from("plugin_logs")
          .update(pluginResult)
          .eq("id", pluginLog.id);
        
        pluginLogs.push({
          id: pluginLog.id,
          plugin_id: plugin.id,
          success: true,
          execution_time: executionTime,
          xp_earned: xpEarned
        });
        
        successCount++;
      } catch (error: any) {
        console.error(`Error executing plugin ${plugin.id}:`, error);
        
        // Update the plugin log with failure
        const { error: updateError } = await supabaseAdmin
          .from("plugin_logs")
          .update({
            status: 'failure',
            error: error.message || String(error),
            execution_time: Math.random() * 1.0 + 0.2, // 0.2 to 1.2 seconds
            xp_earned: 0
          })
          .eq("id", pluginLogs[pluginLogs.length - 1]?.id);
        
        if (updateError) {
          console.error("Error updating plugin log with failure:", updateError);
        }
        
        errors.push({
          plugin_id: plugin.id,
          error: error.message || String(error)
        });
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;
    const status = successCount === totalPlugins ? 'success' : 
                 (successCount > 0 ? 'partial' : 'failure');
    
    // Update the execution record with results
    await supabaseAdmin
      .from("executions")
      .update({
        status,
        output: { 
          plugins_executed: totalPlugins,
          successful_plugins: successCount,
          plugin_logs: pluginLogs,
          errors: errors.length > 0 ? errors : undefined
        },
        execution_time: executionTime,
        xp_earned: pluginLogs.reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0),
        updated_at: new Date().toISOString()
      })
      .eq("id", executionId);
    
    // Log system event
    await supabaseAdmin
      .from("system_logs")
      .insert({
        tenant_id,
        module: 'strategy',
        event: 'strategy_executed',
        context: {
          strategy_id,
          execution_id: executionId,
          status,
          plugins_executed: totalPlugins,
          successful_plugins: successCount
        }
      });
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        execution_id: executionId,
        strategy_id,
        status,
        plugins_executed: totalPlugins,
        successful_plugins: successCount,
        execution_time: executionTime
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error executing strategy:", error);
    
    // Update execution with failure if we have an ID
    if (executionId) {
      try {
        await supabaseAdmin
          .from("executions")
          .update({
            status: "failure",
            error: String(error),
            execution_time: (performance.now() - startTime) / 1000,
            updated_at: new Date().toISOString()
          })
          .eq("id", executionId);
      } catch (updateError) {
        console.error("Error updating execution record with failure:", updateError);
      }
    }
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to execute strategy",
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
