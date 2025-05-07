
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { strategy_id, tenant_id, user_id } = await req.json();
    
    if (!strategy_id) {
      return new Response(
        JSON.stringify({ error: "Strategy ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get the strategy
    const { data: strategy, error: strategyError } = await supabaseAdmin
      .from("strategies")
      .select("*, plugins(id, name)")
      .eq("id", strategy_id)
      .single();

    if (strategyError || !strategy) {
      return new Response(
        JSON.stringify({ error: "Strategy not found", details: strategyError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Get associated plugins for this strategy via plugin_logs
    const { data: pluginLogs, error: pluginLogsError } = await supabaseAdmin
      .from("plugin_logs")
      .select("*, plugins(*), agent_versions(*)")
      .eq("strategy_id", strategy_id);
    
    if (pluginLogsError) {
      return new Response(
        JSON.stringify({ error: "Failed to load plugin logs", details: pluginLogsError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Create execution record
    const { data: execution, error: executionError } = await supabaseAdmin
      .from("executions")
      .insert({
        tenant_id: tenant_id || strategy.tenant_id,
        strategy_id,
        executed_by: user_id,
        type: 'strategy',
        status: 'pending',
        input: { strategy_id, tenant_id }
      })
      .select()
      .single();
      
    if (executionError) {
      console.error("Error creating execution record:", executionError);
    }
    
    // For each plugin log, update status and execute
    let successCount = 0;
    let totalPlugins = pluginLogs?.length || 0;
    
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
        }
        
        // Update agent version XP
        if (log.agent_version_id) {
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
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error executing plugin ${log.plugins?.name || 'unknown'}:`, error);
        
        // Update the plugin log with error
        await supabaseAdmin
          .from("plugin_logs")
          .update({
            status: "failure",
            error: String(error),
            execution_time: Math.random() * 1.5, // Mock failed execution time
            updated_at: new Date().toISOString()
          })
          .eq("id", log.id);
      }
    }
    
    // Calculate completion percentage
    const completionPercentage = totalPlugins > 0 
      ? Math.round((successCount / totalPlugins) * 100)
      : 100;
    
    // Update strategy status and completion
    await supabaseAdmin
      .from("strategies")
      .update({ 
        status: "completed",
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString() 
      })
      .eq("id", strategy_id);
    
    // Update execution status
    if (execution) {
      await supabaseAdmin
        .from("executions")
        .update({
          status: "success",
          output: { 
            success: true,
            completion_percentage: completionPercentage,
            plugins_executed: totalPlugins,
            plugins_succeeded: successCount
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", execution.id);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Strategy executed successfully",
        completion_percentage: completionPercentage,
        plugins_executed: totalPlugins,
        plugins_succeeded: successCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error executing strategy:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
