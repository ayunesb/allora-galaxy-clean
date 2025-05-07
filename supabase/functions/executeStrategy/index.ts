import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../../lib/env.ts";
import { corsHeaders, formatErrorResponse } from "../../lib/corsHeaders.ts";
import { validateEnv, type EnvVar } from "../../lib/validateEnv.ts";

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

// Interface for the strategy execution request
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
    
    return {
      success: true,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      status: 'success',
      plugins_executed: plugins.length || 0,
      execution_time: (performance.now() - startTime) / 1000
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
    
    return {
      success: false,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      error: error.message
    };
  }
}

// Main handler function
serve(async (req) => {
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
      return formatErrorResponse(400, "Invalid JSON in request body", String(parseError));
    }
    
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return formatErrorResponse(400, "Invalid input", validation.errors);
    }
    
    // Check if Supabase client was initialized
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return formatErrorResponse(500, "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
    }
    
    // Create Supabase client
    let supabase;
    try {
      supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    } catch (clientError) {
      return formatErrorResponse(500, "Failed to create Supabase client", String(clientError));
    }
    
    // Execute the strategy
    const result = await executeStrategy(input, supabase);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return formatErrorResponse(500, "Failed to execute strategy", String(error));
  }
});
