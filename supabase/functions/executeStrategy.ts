
// Deno edge function to execute strategies
// Entry point for the executeStrategy edge function

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available
    if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for non-Deno environments
    return process.env[name] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Cors headers
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

// Function to validate input
function validateInput(input: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  return { valid: errors.length === 0, errors };
}

// Function to execute a strategy
async function executeStrategy(input: ExecuteRequest, supabase: any) {
  const startTime = performance.now();
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
        throw new Error(`Failed to record execution: ${execError.message}`);
      }
    } catch (recordError) {
      console.error("Error recording execution start, but continuing:", recordError);
      // Continue execution despite recording error
    }
    
    // Fetch plugins associated with this strategy
    // This is a simplified implementation
    let plugins;
    try {
      const { data, error: pluginsError } = await supabase
        .from('plugins')
        .select('*')
        .eq('status', 'active')
        .limit(3);  // Just for demonstration
        
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      plugins = data || [];
    } catch (pluginsError) {
      console.error("Error fetching plugins:", pluginsError);
      // Set empty plugins array and continue
      plugins = [];
    }
    
    const pluginResults = [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    
    // Execute each plugin
    for (const plugin of plugins) {
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
        
        // Record failed plugin execution
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
    
    const executionTime = (performance.now() - startTime) / 1000;  // Convert to seconds
    const status = successfulPlugins === plugins.length ? 'success' : 
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
    
    // Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      try {
        // In a real implementation, this would update the strategy's progress
        await supabase
          .from('strategies')
          .update({
            completion_percentage: Math.min(100, (strategy.completion_percentage || 0) + 25)
          })
          .eq('id', input.strategy_id);
      } catch (updateError) {
        console.error("Error updating strategy progress:", updateError);
      }
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
            plugins_executed: plugins.length || 0,
            successful_plugins: successfulPlugins,
            xp_earned: xpEarned
          }
        });
    } catch (logError) {
      console.error("Error logging system event:", logError);
    }
    
    return {
      success: true,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      status,
      plugins_executed: plugins.length || 0,
      successful_plugins: successfulPlugins,
      execution_time: executionTime,
      xp_earned: xpEarned
    };
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Update execution record with error
    try {
      await supabase
        .from('executions')
        .update({
          status: 'failure',
          error: error.message,
          execution_time: (performance.now() - startTime) / 1000
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
    
    return {
      success: false,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      error: error.message
    };
  }
}

// Main handler function
Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Parse request body
    let input: ExecuteRequest;
    try {
      input = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body", 
        details: String(parseError) 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        error: "Invalid input", 
        details: validation.errors 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Get Supabase credentials
    let SUPABASE_URL;
    let SUPABASE_SERVICE_KEY;
    
    try {
      SUPABASE_URL = getEnv("SUPABASE_URL");
      SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    } catch (envError) {
      console.error("Error getting environment variables:", envError);
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ 
        error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client
    let supabase;
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } catch (clientError) {
      return new Response(JSON.stringify({ 
        error: "Failed to create Supabase client", 
        details: String(clientError) 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Execute the strategy
    const result = await executeStrategy(input, supabase);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Failed to execute strategy", 
      details: String(error) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
