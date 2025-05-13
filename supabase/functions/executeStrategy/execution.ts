
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { safeGetEnv, logSystemEvent } from "../_shared/edgeUtils/index.ts";
import type { ExecuteStrategyInput } from "./validation.ts";

/**
 * Execute a strategy with its associated plugins
 * @param input The validated execution input 
 * @param supabase Initialized Supabase client
 * @param requestStart Performance measurement start time
 * @returns The execution result
 */
export async function executeStrategy(
  input: ExecuteStrategyInput, 
  supabase: any, 
  requestStart: number
): Promise<any> {
  // Generate a unique execution ID
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
      await recordExecutionStart(supabase, executionId, input);
    } catch (recordError) {
      console.warn("Error recording execution start, continuing anyway:", recordError);
    }
    
    // Fetch plugins and execute them
    const { pluginResults, xpEarned, successfulPlugins, pluginCount } = await executePlugins(
      supabase, input, executionId
    );
    
    // Calculate execution metrics
    const executionTime = (performance.now() - requestStart) / 1000;
    const status = getExecutionStatus(successfulPlugins, pluginCount);
    
    // Update the execution record
    try {
      await updateExecutionRecord(
        supabase, executionId, status, pluginResults, executionTime, xpEarned
      );
    } catch (updateError) {
      console.error("Error updating execution record:", updateError);
    }
    
    // Log system event
    try {
      await logSystemEvent(
        supabase,
        'strategy',
        'strategy_executed',
        {
          strategy_id: input.strategy_id,
          execution_id: executionId,
          status,
          plugins_executed: pluginCount,
          successful_plugins: successfulPlugins,
          xp_earned: xpEarned
        },
        input.tenant_id
      );
    } catch (logError) {
      console.error("Error logging system event:", logError);
    }
    
    // Return success response
    return {
      success: true,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      status,
      plugins_executed: pluginCount,
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
          execution_time: (performance.now() - requestStart) / 1000
        })
        .eq('id', executionId);
    } catch (updateError) {
      console.error("Error updating execution with error status:", updateError);
    }
    
    // Log system event for error
    try {
      await logSystemEvent(
        supabase,
        'strategy',
        'strategy_execution_failed',
        {
          strategy_id: input.strategy_id,
          execution_id: executionId,
          error: error.message
        },
        input.tenant_id
      );
    } catch (logError) {
      console.error("Error logging system error event:", logError);
    }
    
    // Return error response
    return {
      success: false,
      execution_id: executionId,
      strategy_id: input.strategy_id,
      error: error.message,
      execution_time: (performance.now() - requestStart) / 1000
    };
  }
}

/**
 * Record the start of strategy execution
 */
async function recordExecutionStart(
  supabase: any, 
  executionId: string, 
  input: ExecuteStrategyInput
): Promise<void> {
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
}

/**
 * Execute all plugins associated with a strategy
 */
async function executePlugins(
  supabase: any, 
  input: ExecuteStrategyInput,
  executionId: string
): Promise<{
  pluginResults: any[];
  xpEarned: number;
  successfulPlugins: number;
  pluginCount: number;
}> {
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
  
  const pluginResults: any[] = [];
  let xpEarned = 0;
  let successfulPlugins = 0;
  const pluginCount = plugins?.length || 0;
  
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
  
  return { pluginResults, xpEarned, successfulPlugins, pluginCount };
}

/**
 * Update the execution record with results
 */
async function updateExecutionRecord(
  supabase: any,
  executionId: string,
  status: string,
  pluginResults: any[],
  executionTime: number,
  xpEarned: number
): Promise<void> {
  await supabase
    .from('executions')
    .update({
      status,
      output: { plugins: pluginResults },
      execution_time: executionTime,
      xp_earned: xpEarned
    })
    .eq('id', executionId);
}

/**
 * Determine the execution status based on plugin success rate
 */
function getExecutionStatus(successfulPlugins: number, totalPlugins: number): string {
  if (totalPlugins === 0) {
    return 'success'; // No plugins to execute is considered success
  }
  
  if (successfulPlugins === totalPlugins) {
    return 'success';
  } else if (successfulPlugins > 0) {
    return 'partial';
  } else {
    return 'failure';
  }
}

/**
 * Initialize Supabase client for strategy execution
 */
export function initializeSupabase(): any {
  const SUPABASE_URL = safeGetEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = safeGetEnv("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Required environment variables are not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}
