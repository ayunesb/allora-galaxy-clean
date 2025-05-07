
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategyId } = await req.json();
    
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
      .eq("id", strategyId)
      .single();

    if (strategyError || !strategy) {
      return new Response(
        JSON.stringify({ error: "Strategy not found", details: strategyError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Get associated plugins for this strategy
    const { data: relatedPlugins, error: pluginsError } = await supabaseAdmin
      .from("plugins")
      .select("*, agent_versions(id, version, prompt)");
    
    if (pluginsError) {
      return new Response(
        JSON.stringify({ error: "Failed to load plugins", details: pluginsError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // For each plugin, execute it against the strategy
    for (const plugin of relatedPlugins || []) {
      // Get the active agent version
      const activeAgent = plugin.agent_versions?.find(v => v.status === 'active');
      
      if (!activeAgent) continue;
      
      try {
        // In a real implementation, this would call an AI service
        // Here we're just mocking a successful execution
        const pluginResult = {
          output: {
            result: `Generated content for ${strategy.title} using ${plugin.name}`,
            metadata: {
              strategyId: strategy.id,
              pluginId: plugin.id,
            }
          }
        };
        
        // Log the plugin execution
        const { data: logEntry, error: logError } = await supabaseAdmin
          .from("plugin_logs")
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategy.id,
            tenant_id: strategy.tenant_id,
            agent_version_id: activeAgent.id,
            status: "success",
            input: { strategy: strategy.title },
            output: pluginResult.output,
            execution_time: Math.random() * 2.5, // Mock execution time
            xp_earned: Math.floor(Math.random() * 20) + 10, // Mock XP earned
          })
          .select()
          .single();
          
        if (logError) {
          console.error("Error logging plugin execution:", logError);
        }
        
        // Update plugin XP
        if (logEntry) {
          await supabaseAdmin
            .from("plugins")
            .update({ 
              xp: plugin.xp + logEntry.xp_earned,
              updated_at: new Date().toISOString()
            })
            .eq("id", plugin.id);
            
          await supabaseAdmin
            .from("agent_versions")
            .update({ 
              xp: activeAgent.xp + logEntry.xp_earned,
              updated_at: new Date().toISOString()
            })
            .eq("id", activeAgent.id);
        }
      } catch (error) {
        console.error(`Error executing plugin ${plugin.name}:`, error);
        
        // Log the failure
        await supabaseAdmin
          .from("plugin_logs")
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategy.id,
            tenant_id: strategy.tenant_id,
            agent_version_id: activeAgent.id,
            status: "failure",
            input: { strategy: strategy.title },
            error: String(error),
            execution_time: 0,
            xp_earned: 0,
          });
      }
    }
    
    // Update strategy status to completed
    await supabaseAdmin
      .from("strategies")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString() 
      })
      .eq("id", strategyId);
    
    return new Response(
      JSON.stringify({ success: true, message: "Strategy executed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
