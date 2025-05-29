// REMOVE this line if you are not deploying to Deno/Supabase Edge Functions:
// import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@0.131.0/http/server.js";

// If you are running locally with Node.js, you cannot use 'serve' from Deno std.
// If this is for Supabase Edge Functions, you must import 'serve' from a Deno-compatible URL.
// For Node.js, replace the following block with your HTTP server logic.
// For Deno/Supabase Edge, add this import at the top:
// import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// serve(async (req) => { ...existing code... });

/*
If running in Node.js, use:
import { createServer } from "http";
createServer((req, res) => {
  // handle requests here
}).listen(3000);
*/

// If you are running locally with Node.js, use a Node.js HTTP server or Express instead.
// If this is for Supabase Edge Functions, keep the Deno import and deploy with Supabase CLI.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    // Use type assertion here for Deno environment
    const deno = (globalThis as { Deno?: { env?: { get: (name: string) => string | undefined } } });
    if (deno.Deno && typeof deno.Deno.env?.get === "function") {
      return deno.Deno.env.get(name) ?? fallback;
    }
    return fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

serve(async (req) => {
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
    const errors = [];
    const pluginLogs = [];
    
    // Process plugins in series to maintain order and prevent race conditions
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
          
        // In a real implementation, this would call an AI service
        // Here we're simulating a plugin execution
        const executionTime = Math.random() * 2.5 + 0.5; // 0.5 to 3 seconds
        const xpEarned = Math.floor(Math.random() * 15) + 5; // 5 to 20 XP
        const randomSuccess = Math.random() > 0.2; // 80% success rate
        
        // Wait to simulate processing time
        await new Promise(resolve => setTimeout(resolve, executionTime * 1000));
        
        if (!randomSuccess) {
          throw new Error(`Plugin execution failed for ${plugin.name || 'unknown plugin'}`);
        }
        
        const pluginResult = {
          output: {
            result: `Generated content for ${strategy.title} using ${plugin.name || 'plugin'}`,
            metadata: {
              strategyId: strategy.id,
              pluginId: plugin.id,
              agentVersionId: agentVersion?.id
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
          .eq("id", pluginLog.id);
          
        // Update plugin XP
        await supabaseAdmin
          .from("plugins")
          .update({ 
            xp: supabaseAdmin.rpc('increment', { amount: xpEarned }),
            updated_at: new Date().toISOString()
          })
          .eq("id", plugin.id);
        
        // Update agent version XP if applicable
        if (agentVersion) {
          await supabaseAdmin
            .from("agent_versions")
            .update({ 
              xp: supabaseAdmin.rpc('increment', { amount: xpEarned }),
              updated_at: new Date().toISOString()
            })
            .eq("id", agentVersion.id);
        }
        
        // Add to plugin logs array
        pluginLogs.push({
          id: pluginLog.id,
          plugin_id: plugin.id,
          plugin_name: plugin.name,
          status: "success",
          execution_time: executionTime,
          xp_earned: xpEarned
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error executing plugin ${plugin.name || 'unknown'}:`, error);
        
        // Track errors for reporting
        errors.push({
          plugin_name: plugin.name || 'unknown',
          error: String(error)
        });
        
        // Update the plugin log with error if it exists
        try {
          const { data: existingLog } = await supabaseAdmin
            .from("plugin_logs")
            .select("id")
            .eq("plugin_id", plugin.id)
            .eq("strategy_id", strategy_id)
            .eq("status", "pending")
            .maybeSingle();
            
          if (existingLog) {
            await supabaseAdmin
              .from("plugin_logs")
              .update({
                status: "failure",
                error: String(error),
                execution_time: Math.random() * 1.5, // Mock failed execution time
                updated_at: new Date().toISOString()
              })
              .eq("id", existingLog.id);
              
            // Add to plugin logs array
            pluginLogs.push({
              id: existingLog.id,
              plugin_id: plugin.id,
              plugin_name: plugin.name,
              status: "failure",
              error: String(error)
            });
          }
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
          status: completionPercentage === 100 ? "completed" : "partial",
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
              plugin_logs: pluginLogs,
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
    
    // Send notifications if enabled and there are users to notify
    if (options.send_notifications) {
      try {
        // Get tenant users who should receive notifications
        const { data: users } = await supabaseAdmin
          .from("tenant_user_roles")
          .select("user_id")
          .eq("tenant_id", tenant_id)
          .in("role", ["admin", "manager"]);
          
        if (users && users.length > 0) {
          const userIds = users.map(u => u.user_id);
          
          // Create notifications for all relevant users
          await supabaseAdmin
            .from("notifications")
            .insert(userIds.map(uid => ({
              tenant_id,
              user_id: uid,
              title: completionPercentage === 100 
                ? "Strategy execution completed" 
                : `Strategy execution ${completionPercentage}% complete`,
              message: `Strategy "${strategy.title}" executed with ${successCount}/${totalPlugins} plugins successful`,
              type: errors.length > 0 ? "warning" : "success",
              action_url: `/strategies/${strategy_id}`
            })));
        }
      } catch (notifError) {
        console.error("Error sending notifications, but continuing:", notifError);
      }
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

/*
If running in Node.js, use:
import { createServer } from "http";
createServer((req, res) => {
  // handle requests here
}).listen(3000);
*/

// If this is for Supabase Edge Functions, use the recommended Supabase CLI and deploy as Deno.
// Otherwise, refactor to use Node.js compatible modules and environment variable access (process.env).
