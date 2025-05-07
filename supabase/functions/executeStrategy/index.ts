
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { validateEnv, type EnvVar } from "../../lib/validateEnv.ts";
import { 
  executeStrategySchema,
  formatErrorResponse,
  formatSuccessResponse,
  safeParseRequest
} from "../../lib/validation.ts";

const MODULE_NAME = "executeStrategy";

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

serve(async (req) => {
  const startTime = performance.now();
  let executionId: string | null = null;
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${MODULE_NAME}: Processing request`);

    // Create Supabase client with admin privileges
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return formatErrorResponse(
        500, 
        "Supabase client could not be initialized", 
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
        (performance.now() - startTime) / 1000
      );
    }
    
    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Parse and validate request using zod schema
    const [payload, parseError] = await safeParseRequest(req, executeStrategySchema);
    
    if (parseError || !payload) {
      console.error(`${MODULE_NAME}: Invalid payload - ${parseError}`);
      return formatErrorResponse(400, parseError || "Invalid request", undefined, (performance.now() - startTime) / 1000);
    }
    
    const { strategy_id, tenant_id, user_id, options } = payload;

    // Generate a unique execution ID
    executionId = crypto.randomUUID();

    try {
      console.log(`${MODULE_NAME}: Creating execution record ${executionId}`);
      
      // Record the execution start
      const { error: execError } = await supabaseAdmin
        .from('executions')
        .insert({
          id: executionId,
          tenant_id: tenant_id,
          strategy_id: strategy_id,
          executed_by: user_id,
          type: 'strategy',
          status: 'pending',
          input: options || {},
          created_at: new Date().toISOString()
        });
      
      if (execError) {
        console.error(`${MODULE_NAME}: Failed to record execution:`, execError);
      }
    } catch (recordError) {
      console.error(`${MODULE_NAME}: Error recording execution start, but continuing:`, recordError);
      // Continue execution despite recording error
    }
    
    try {
      // Verify the strategy exists and belongs to the tenant
      console.log(`${MODULE_NAME}: Fetching strategy ${strategy_id} for tenant ${tenant_id}`);
      
      const { data: strategy, error: strategyError } = await supabaseAdmin
        .from('strategies')
        .select('id, title, status')
        .eq('id', strategy_id)
        .eq('tenant_id', tenant_id)
        .single();
      
      if (strategyError || !strategy) {
        const errorMessage = `Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`;
        console.error(`${MODULE_NAME}: ${errorMessage}`);
        
        // Update execution record with error
        try {
          if (executionId) {
            await supabaseAdmin
              .from('executions')
              .update({
                status: 'failure',
                error: errorMessage,
                execution_time: (performance.now() - startTime) / 1000
              })
              .eq('id', executionId);
          }
        } catch (updateError) {
          console.error(`${MODULE_NAME}: Error updating execution status:`, updateError);
        }
        
        return formatErrorResponse(404, errorMessage, undefined, (performance.now() - startTime) / 1000);
      }
      
      if (strategy.status !== 'approved' && strategy.status !== 'pending') {
        const errorMessage = `Strategy cannot be executed with status: ${strategy.status}`;
        console.error(`${MODULE_NAME}: ${errorMessage}`);
        
        // Update execution record with error
        try {
          if (executionId) {
            await supabaseAdmin
              .from('executions')
              .update({
                status: 'failure',
                error: errorMessage,
                execution_time: (performance.now() - startTime) / 1000
              })
              .eq('id', executionId);
          }
        } catch (updateError) {
          console.error(`${MODULE_NAME}: Error updating execution status:`, updateError);
        }
        
        return formatErrorResponse(400, errorMessage, undefined, (performance.now() - startTime) / 1000);
      }
    } catch (strategyCheckError) {
      console.error(`${MODULE_NAME}: Error verifying strategy:`, strategyCheckError);
      
      // Update execution record with error
      try {
        if (executionId) {
          await supabaseAdmin
            .from('executions')
            .update({
              status: 'failure',
              error: String(strategyCheckError),
              execution_time: (performance.now() - startTime) / 1000
            })
            .eq('id', executionId);
        }
      } catch (updateError) {
        console.error(`${MODULE_NAME}: Error updating execution status:`, updateError);
      }
      
      return formatErrorResponse(500, "Failed to verify strategy", String(strategyCheckError), (performance.now() - startTime) / 1000);
    }
    
    // Fetch plugins associated with this strategy
    let plugins;
    try {
      console.log(`${MODULE_NAME}: Fetching active plugins for strategy ${strategy_id}`);
      
      const { data, error: pluginsError } = await supabaseAdmin
        .from('plugins')
        .select('*')
        .eq('status', 'active')
        .limit(3);  // Just for demonstration
        
      if (pluginsError) {
        throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
      }
      
      plugins = data || [];
    } catch (pluginsError) {
      console.error(`${MODULE_NAME}: Error fetching plugins:`, pluginsError);
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
        console.log(`${MODULE_NAME}: Executing plugin ${plugin.id} for strategy ${strategy_id}`);
        
        // Record plugin execution
        const { data: logData, error: logError } = await supabaseAdmin
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategy_id,
            tenant_id: tenant_id,
            status: 'success',
            input: options || {},
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
        
      } catch (pluginError) {
        console.error(`${MODULE_NAME}: Error executing plugin ${plugin.id}:`, pluginError);
        
        // Record failed plugin execution
        try {
          await supabaseAdmin
            .from('plugin_logs')
            .insert({
              plugin_id: plugin.id,
              strategy_id: strategy_id,
              tenant_id: tenant_id,
              status: 'failure',
              input: options || {},
              error: String(pluginError),
              execution_time: 0.3,
              xp_earned: 0
            });
        } catch (logError) {
          console.error(`${MODULE_NAME}: Error recording plugin failure:`, logError);
        }
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: false,
          error: String(pluginError),
          xp_earned: 0
        });
      }
    }
    
    const executionTime = (performance.now() - startTime) / 1000;  // Convert to seconds
    const status = successfulPlugins === plugins.length ? 'success' : 
                  (successfulPlugins > 0 ? 'partial' : 'failure');
    
    // Update the execution record
    try {
      console.log(`${MODULE_NAME}: Updating execution record ${executionId} with status ${status}`);
      
      await supabaseAdmin
        .from('executions')
        .update({
          status,
          output: { plugins: pluginResults },
          execution_time: executionTime,
          xp_earned: xpEarned
        })
        .eq('id', executionId);
    } catch (updateError) {
      console.error(`${MODULE_NAME}: Error updating execution record:`, updateError);
    }
    
    // Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      try {
        console.log(`${MODULE_NAME}: Updating strategy progress for ${strategy_id}`);
        
        await supabaseAdmin
          .from('strategies')
          .update({
            completion_percentage: supabaseAdmin.rpc('increment_percentage', { 
              current_value: 0,  // Will be overridden by the RPC function
              strategy_id: strategy_id,
              amount: 25
            })
          })
          .eq('id', strategy_id);
      } catch (updateError) {
        console.error(`${MODULE_NAME}: Error updating strategy progress:`, updateError);
      }
    }
    
    // Log system event
    try {
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id: tenant_id,
          module: 'strategy',
          event: 'strategy_executed',
          context: {
            strategy_id: strategy_id,
            execution_id: executionId,
            status,
            plugins_executed: plugins.length || 0,
            successful_plugins: successfulPlugins,
            xp_earned: xpEarned
          }
        });
    } catch (logError) {
      console.error(`${MODULE_NAME}: Error logging system event:`, logError);
    }
    
    console.log(`${MODULE_NAME}: Strategy execution completed with status ${status}`);
    
    return formatSuccessResponse({
      execution_id: executionId,
      strategy_id: strategy_id,
      status,
      plugins_executed: plugins.length || 0,
      successful_plugins: successfulPlugins,
      execution_time: executionTime,
      xp_earned: xpEarned
    }, executionTime);
    
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    
    // Update execution record with error
    try {
      if (executionId) {
        const supabaseAdmin = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '');
        
        await supabaseAdmin
          .from('executions')
          .update({
            status: 'failure',
            error: String(error),
            execution_time: (performance.now() - startTime) / 1000
          })
          .eq('id', executionId);
      }
    } catch (updateError) {
      console.error(`${MODULE_NAME}: Error updating execution with error status:`, updateError);
    }
    
    return formatErrorResponse(500, "Failed to execute strategy", String(error), (performance.now() - startTime) / 1000);
  }
});
