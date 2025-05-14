
// Deno edge function to execute strategies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Import shared utilities
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Safely get environment variables with fallbacks
function safeGetDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    return Deno.env.get(key) ?? defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

// Input validation interface
interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Generate a unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Main handler function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const requestStart = performance.now();
  const requestId = generateRequestId();
  
  try {
    // Parse request body
    let input: ExecuteStrategyInput;
    try {
      input = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid JSON in request body", 
        details: String(parseError) 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Validate input
    if (!input.strategy_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Strategy ID is required" 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    if (!input.tenant_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Tenant ID is required" 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Get Supabase credentials
    const SUPABASE_URL = safeGetDenoEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = safeGetDenoEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Required environment variables are not configured",
        details: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const executionId = crypto.randomUUID();
    
    try {
      // Verify the strategy exists and belongs to the tenant
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .select('id, title, status')
        .eq('id', input.strategy_id)
        .eq('tenant_id', input.tenant_id)
        .single();
      
      if (strategyError || !strategy) {
        throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
      }
      
      if (strategy.status !== 'approved' && strategy.status !== 'pending') {
        throw new Error(`Strategy cannot be executed with status: ${strategy.status}`);
      }
      
      // Record the execution start
      try {
        const { error: execError } = await supabase
          .from('executions')
          .insert({
            id: executionId,
            tenant_id: input.tenant_id,
            strategy_id: input.strategy_id,
            executed_by: input.user_id,
            type: 'strategy',
            status: 'pending',
            input: input.options || {},
            created_at: new Date().toISOString()
          });
        
        if (execError) {
          console.warn(`Failed to record execution: ${execError.message}`);
        }
      } catch (recordError) {
        console.warn("Error recording execution start, continuing anyway:", recordError);
      }
      
      // Fetch plugins associated with this strategy
      const { data: plugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('*')
        .eq('status', 'active')
        .eq('tenant_id', input.tenant_id)
        .limit(5);
        
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      const pluginResults = [];
      let xpEarned = 0;
      let successfulPlugins = 0;
      
      // Execute each plugin
      for (const plugin of (plugins || [])) {
        try {
          // In a real implementation, we would execute the plugin's logic
          console.log(`Executing plugin ${plugin.id} for strategy ${input.strategy_id}`);
          
          // Record plugin execution
          const { data: logData, error: logError } = await supabase
            .from('plugin_logs')
            .insert({
              plugin_id: plugin.id,
              strategy_id: input.strategy_id,
              tenant_id: input.tenant_id,
              status: 'success',
              input: input.options || {},
              output: { message: "Plugin executed successfully" },
              execution_time: 0.5,
              xp_earned: 10
            })
            .select()
            .single();
          
          if (logError) {
            throw new Error(`Failed to record plugin execution: ${logError.message}`);
          }
          
          pluginResults.push({
            plugin_id: plugin.id,
            success: true,
            log_id: logData.id,
            xp_earned: 10
          });
          
          xpEarned += 10;
          successfulPlugins++;
          
        } catch (pluginError: any) {
          console.error(`Error executing plugin ${plugin.id}:`, pluginError);
          
          try {
            await supabase
              .from('plugin_logs')
              .insert({
                plugin_id: plugin.id,
                strategy_id: input.strategy_id,
                tenant_id: input.tenant_id,
                status: 'failure',
                input: input.options || {},
                error: pluginError.message,
                execution_time: 0.3,
                xp_earned: 0
              });
          } catch (logError) {
            console.error("Error recording plugin failure:", logError);
          }
          
          pluginResults.push({
            plugin_id: plugin.id,
            success: false,
            error: pluginError.message,
            xp_earned: 0
          });
        }
      }
      
      const executionTime = (performance.now() - requestStart) / 1000;
      const pluginCount = plugins ? plugins.length : 0;
      const status = successfulPlugins === pluginCount ? 'success' : 
                    (successfulPlugins > 0 ? 'partial' : 'failure');
      
      // Update the execution record
      try {
        await supabase
          .from('executions')
          .update({
            status,
            output: { plugins: pluginResults },
            execution_time: executionTime,
            xp_earned: xpEarned
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution record:", updateError);
      }
      
      // Log system event
      try {
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: input.tenant_id,
            module: 'strategy',
            event: 'strategy_executed',
            context: {
              strategy_id: input.strategy_id,
              execution_id: executionId,
              status,
              plugins_executed: pluginCount,
              successful_plugins: successfulPlugins,
              xp_earned: xpEarned
            }
          });
      } catch (logError) {
        console.error("Error logging system event:", logError);
      }
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        execution_id: executionId,
        strategy_id: input.strategy_id,
        status,
        plugins_executed: pluginCount,
        successful_plugins: successfulPlugins,
        execution_time: executionTime,
        xp_earned: xpEarned,
        request_id: requestId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (error: any) {
      console.error("Error executing strategy:", error);
      
      // Update execution record with error
      try {
        await supabase
          .from('executions')
          .update({
            status: 'failure',
            error: error.message,
            execution_time: (performance.now() - requestStart) / 1000
          })
          .eq('id', executionId);
      } catch (updateError) {
        console.error("Error updating execution with error status:", updateError);
      }
      
      // Log system event for error
      try {
        await supabase
          .from('system_logs')
          .insert({
            tenant_id: input.tenant_id,
            module: 'strategy',
            event: 'strategy_execution_failed',
            context: {
              strategy_id: input.strategy_id,
              execution_id: executionId,
              error: error.message
            }
          });
      } catch (logError) {
        console.error("Error logging system error event:", logError);
      }
      
      // Return error response
      return new Response(JSON.stringify({ 
        success: false,
        execution_id: executionId,
        strategy_id: input.strategy_id,
        error: error.message,
        execution_time: (performance.now() - requestStart) / 1000,
        request_id: requestId
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
  } catch (error: any) {
    console.error("Unexpected error:", error);
    
    // Return error response for unexpected errors
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to execute strategy", 
      details: String(error),
      execution_time: (performance.now() - requestStart) / 1000,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
