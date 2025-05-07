
// Deno edge function to execute strategies safely with error handling
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

// Function to execute a strategy with comprehensive error handling
async function executeStrategy(input: ExecuteRequest, supabase: any) {
  const startTime = performance.now();
  const executionId = crypto.randomUUID();
  
  try {
    // Verify the strategy exists and belongs to the tenant
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id, title, status, completion_percentage')
      .eq('id', input.strategy_id)
      .eq('tenant_id', input.tenant_id)
      .single();
    
    if (strategyError || !strategy) {
      throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
    }
    
    if (strategy.status !== 'approved' && strategy.status !== 'pending') {
      throw new Error(`Strategy cannot be executed with status: ${strategy.status}`);
    }
    
    // Record the execution start with automatic retry
    const MAX_RECORD_ATTEMPTS = 3;
    let recordAttempt = 0;
    let execSuccess = false;
    
    while (recordAttempt < MAX_RECORD_ATTEMPTS && !execSuccess) {
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
        execSuccess = true;
      } catch (recordError) {
        recordAttempt++;
        if (recordAttempt >= MAX_RECORD_ATTEMPTS) {
          console.error("Error recording execution after multiple attempts:", recordError);
          // Continue execution despite recording error
        } else {
          // Wait before retry
          await new Promise(r => setTimeout(r, 500 * recordAttempt));
        }
      }
    }
    
    // Log execution start
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: input.tenant_id,
          module: 'strategy',
          event: 'strategy_execution_started',
          context: {
            strategy_id: input.strategy_id,
            execution_id: executionId
          }
        });
    } catch (logError) {
      console.warn("Failed to log execution start, continuing:", logError);
    }
    
    // Fetch plugins associated with this strategy with error handling
    let plugins = [];
    try {
      const { data, error: pluginsError } = await supabase
        .from('plugins')
        .select('*')
        .eq('status', 'active')
        .eq('tenant_id', input.tenant_id)
        .order('metadata->order', { ascending: true, nullsLast: true })
        .limit(10);
        
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
    let completedPluginIds = new Set<string>();
    
    // Execute each plugin with dependency checks
    for (const plugin of plugins) {
      try {
        // Check dependencies if any
        const dependencies = plugin.metadata?.dependencies || [];
        const unsatisfiedDependencies = dependencies.filter(
          (depId: string) => !completedPluginIds.has(depId)
        );
        
        if (unsatisfiedDependencies.length > 0) {
          pluginResults.push({
            plugin_id: plugin.id,
            success: false,
            error: `Unsatisfied dependencies: ${unsatisfiedDependencies.join(', ')}`,
            xp_earned: 0
          });
          continue;
        }
        
        // In a real implementation, we would execute the plugin's logic
        console.log(`Executing plugin ${plugin.id} for strategy ${input.strategy_id}`);
        
        // Simulate plugin execution (success with 80% probability)
        const simulateSuccess = Math.random() < 0.8;
        const pluginXp = simulateSuccess ? 10 : 0;
        
        // Record plugin execution
        const { data: logData, error: logError } = await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: input.strategy_id,
            tenant_id: input.tenant_id,
            status: simulateSuccess ? 'success' : 'failure',
            input: input.options || {},
            output: simulateSuccess 
              ? { message: "Plugin executed successfully" }
              : null,
            error: simulateSuccess 
              ? null 
              : "Simulated plugin failure",
            execution_time: Math.random() * 1.5,
            xp_earned: pluginXp
          })
          .select()
          .single();
        
        if (logError) {
          throw new Error(`Failed to record plugin execution: ${logError.message}`);
        }
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: simulateSuccess,
          log_id: logData.id,
          xp_earned: pluginXp
        });
        
        if (simulateSuccess) {
          xpEarned += pluginXp;
          successfulPlugins++;
          completedPluginIds.add(plugin.id);
        }
        
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
              error: pluginError.message || 'Unknown error',
              execution_time: 0.3,
              xp_earned: 0
            });
        } catch (logError) {
          console.error("Error recording plugin failure:", logError);
        }
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: false,
          error: pluginError.message || 'Unknown error',
          xp_earned: 0
        });
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;  // Convert to seconds
    const status = successfulPlugins === plugins.length ? 'success' : 
                  (successfulPlugins > 0 ? 'partial' : 'failure');
    
    // Update the execution record with retry logic
    let updateAttempt = 0;
    const MAX_UPDATE_ATTEMPTS = 3;
    let updateSuccess = false;
    
    while (updateAttempt < MAX_UPDATE_ATTEMPTS && !updateSuccess) {
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
          
        updateSuccess = true;
      } catch (updateError) {
        updateAttempt++;
        console.error(`Error updating execution record (attempt ${updateAttempt}):`, updateError);
        
        if (updateAttempt >= MAX_UPDATE_ATTEMPTS) {
          console.error("Failed to update execution record after multiple attempts");
        } else {
          // Wait before retry
          await new Promise(r => setTimeout(r, 500 * updateAttempt));
        }
      }
    }
    
    // Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      try {
        // Calculate new completion percentage with bounds checking
        const progressIncrement = status === 'success' ? 25 : 10;
        const newCompletion = Math.min(100, Math.max(0, 
          (strategy.completion_percentage || 0) + progressIncrement
        ));
        
        await supabase
          .from('strategies')
          .update({
            completion_percentage: newCompletion,
            updated_at: new Date().toISOString()
          })
          .eq('id', input.strategy_id);
      } catch (updateError) {
        console.error("Error updating strategy progress:", updateError);
      }
    }
    
    // Log system event for execution completion
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
            xp_earned: xpEarned,
            execution_time: executionTime
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
    
    // Update execution record with error status
    try {
      await supabase
        .from('executions')
        .update({
          status: 'failure',
          error: error.message || 'Unknown error',
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
            error: error.message || 'Unknown error',
            execution_time: (performance.now() - startTime) / 1000
          }
        });
    } catch (logError) {
      console.error("Error logging system error event:", logError);
    }
    
    return {
      success: false,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      error: error.message || 'Unknown error',
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}

// Main handler function with improved error boundaries
Deno.serve(async (req) => {
  const requestStart = performance.now();
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Request validation with helpful error messages
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: "Method not allowed", 
        allowed: ["POST", "OPTIONS"]
      }), { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Parse request body with error handling
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
    
    // Input validation with detailed errors
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
    
    // Get Supabase credentials with error handling
    let SUPABASE_URL = '';
    let SUPABASE_SERVICE_KEY = '';
    
    try {
      SUPABASE_URL = getEnv("SUPABASE_URL");
      SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        throw new Error("Missing required environment variables");
      }
    } catch (envError) {
      console.error("Error getting environment variables:", envError);
      return new Response(JSON.stringify({ 
        error: "Server configuration error", 
        details: "Environment variables not properly configured"
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Create Supabase client with error handling
    let supabase;
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.31.0");
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } catch (clientError) {
      return new Response(JSON.stringify({ 
        error: "Failed to create database client", 
        details: String(clientError) 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    // Execute the strategy with comprehensive error handling
    const result = await executeStrategy(input, supabase);
    result.request_duration = (performance.now() - requestStart) / 1000;
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Calculate total request duration
    const requestDuration = (performance.now() - requestStart) / 1000;
    
    return new Response(JSON.stringify({ 
      success: false,
      error: "Unexpected server error", 
      details: String(error),
      request_duration: requestDuration
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
