
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnvVar, corsHeaders, validateEnv, logEnvStatus, formatErrorResponse } from "../../../src/lib/edge/envManager.ts";
import { 
  ExecuteStrategyInput, 
  ExecuteStrategyResult,
  PluginExecutionResult 
} from "../../../src/lib/strategy/types.ts";
import { 
  validateInput, 
  createSupabaseAdmin,
  logExecutionStart,
  logExecutionComplete,
  logPluginExecution,
  logSystemEvent
} from "../../../src/lib/strategy/executeUtils.ts";

// Define environment variables needed for this function
const requiredEnv = [
  { 
    name: 'SUPABASE_URL', 
    required: true,
    description: 'Supabase project URL for database access'
  },
  { 
    name: 'SUPABASE_SERVICE_ROLE_KEY', 
    required: true,
    description: 'Service role key for admin database access'
  }
];

// Validate all required environment variables at startup
const env = validateEnv(requiredEnv);

// Log environment status on startup (redacted)
logEnvStatus(env);

// Create Supabase client outside the handler
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Supabase client was initialized properly
  if (!supabaseAdmin) {
    return formatErrorResponse(
      500, 
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
    );
  }

  try {
    // Parse request body
    let input: ExecuteStrategyInput;
    try {
      input = await req.json();
    } catch (parseError) {
      return formatErrorResponse(400, "Invalid JSON in request body", String(parseError));
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return formatErrorResponse(400, "Invalid input", validation.errors);
    }
    
    // Execute the strategy
    const result = await executeStrategy(input, supabaseAdmin);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return formatErrorResponse(500, "Failed to execute strategy", String(error));
  }
});

/**
 * Execute a strategy with proper error handling
 */
async function executeStrategy(
  input: ExecuteStrategyInput, 
  supabase: any
): Promise<ExecuteStrategyResult> {
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
    
    // Record the execution start
    await logExecutionStart(supabase, executionId, input);
    
    // Fetch plugins associated with this strategy
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .limit(3);  // Just for demonstration
        
    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }
    
    const pluginResults: PluginExecutionResult[] = [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    
    // Execute each plugin
    for (const plugin of plugins || []) {
      try {
        // In a real implementation, we would execute the plugin's logic
        console.log(`Executing plugin ${plugin.id} for strategy ${input.strategy_id}`);
        
        // Record plugin execution
        const logId = await logPluginExecution(
          supabase,
          input.tenant_id,
          input.strategy_id,
          plugin.id,
          'success',
          input.options || {},
          { message: "Plugin executed successfully" },
          null,
          0.5,
          10
        );
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: true,
          log_id: logId || undefined,
          xp_earned: 10
        });
        
        xpEarned += 10;
        successfulPlugins++;
        
      } catch (pluginError: any) {
        console.error(`Error executing plugin ${plugin.id}:`, pluginError);
        
        // Record failed plugin execution
        const logId = await logPluginExecution(
          supabase,
          input.tenant_id,
          input.strategy_id,
          plugin.id,
          'failure',
          input.options || {},
          null,
          pluginError.message,
          0.3,
          0
        );
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: false,
          log_id: logId || undefined,
          xp_earned: 0,
          error: pluginError.message
        });
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;  // Convert to seconds
    const status = successfulPlugins === (plugins?.length || 0) ? 'success' : 
                  (successfulPlugins > 0 ? 'partial' : 'failure');
    
    // Update the execution record
    await logExecutionComplete(
      supabase,
      executionId,
      status,
      { plugins: pluginResults },
      executionTime,
      xpEarned
    );
    
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
    await logSystemEvent(
      supabase,
      input.tenant_id,
      'strategy',
      'strategy_executed',
      {
        strategy_id: input.strategy_id,
        execution_id: executionId,
        status,
        plugins_executed: plugins?.length || 0,
        successful_plugins: successfulPlugins,
        xp_earned: xpEarned
      }
    );
    
    return {
      success: true,
      strategy_id: input.strategy_id,
      execution_id: executionId,
      status,
      plugins_executed: plugins?.length || 0,
      successful_plugins: successfulPlugins,
      execution_time: executionTime,
      xp_earned: xpEarned
    };
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Update execution record with error
    await logExecutionComplete(
      supabase,
      executionId,
      'failure',
      null,
      (performance.now() - startTime) / 1000,
      0
    );
    
    // Log system event for error
    await logSystemEvent(
      supabase,
      input.tenant_id,
      'strategy',
      'strategy_execution_failed',
      {
        strategy_id: input.strategy_id,
        execution_id: executionId,
        error: error.message
      }
    );
    
    return {
      success: false,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      error: error.message
    };
  }
}
