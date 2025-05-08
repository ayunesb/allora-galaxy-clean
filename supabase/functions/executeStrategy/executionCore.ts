
import { ExecuteRequest, getEnv } from "./validation.ts";

/**
 * Function to execute a strategy with comprehensive error handling
 */
export async function executeStrategy(input: ExecuteRequest, supabase: any) {
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
    const pluginsResult = await fetchPlugins(supabase, input.tenant_id);
    const plugins = pluginsResult.plugins || [];
    
    // Execute plugins and collect results
    const executionResults = await executePlugins(
      supabase, 
      plugins, 
      input.strategy_id, 
      input.tenant_id, 
      executionId, 
      input.options || {}
    );
    
    const { pluginResults, xpEarned, successfulPlugins, completedPluginIds } = executionResults;
    
    // Determine overall status
    const totalPlugins = plugins.length;
    const status = successfulPlugins === totalPlugins ? 'success' : 
                 (successfulPlugins > 0 ? 'partial' : 'failure');
    
    const executionTime = (performance.now() - startTime) / 1000;  // Convert to seconds
    
    // Update the execution record with retry logic
    await updateExecutionRecord(
      supabase, 
      executionId, 
      status, 
      pluginResults, 
      executionTime, 
      xpEarned
    );
    
    // Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      await updateStrategyProgress(
        supabase, 
        input.strategy_id, 
        status, 
        strategy.completion_percentage || 0
      );
    }
    
    // Log system event for execution completion
    await logSystemEvent(
      supabase,
      input.tenant_id,
      'strategy',
      'strategy_executed',
      {
        strategy_id: input.strategy_id,
        execution_id: executionId,
        status,
        plugins_executed: plugins.length || 0,
        successful_plugins: successfulPlugins,
        xp_earned: xpEarned,
        execution_time: executionTime
      }
    );
    
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

/**
 * Fetch plugins for the strategy
 */
async function fetchPlugins(supabase: any, tenantId: string) {
  try {
    const { data, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .eq('tenant_id', tenantId)
      .order('metadata->order', { ascending: true, nullsLast: true })
      .limit(10);
      
    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }
    
    return { plugins: data || [] };
  } catch (pluginsError) {
    console.error("Error fetching plugins:", pluginsError);
    return { plugins: [] };
  }
}

/**
 * Execute plugins for a strategy
 */
async function executePlugins(
  supabase: any,
  plugins: any[],
  strategyId: string,
  tenantId: string,
  executionId: string,
  options: Record<string, any> = {}
) {
  const pluginResults: any[] = [];
  let xpEarned = 0;
  let successfulPlugins = 0;
  const completedPluginIds = new Set<string>();
  
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
      console.log(`Executing plugin ${plugin.id} for strategy ${strategyId}`);
      
      // Simulate plugin execution (success with 80% probability)
      const simulateSuccess = Math.random() < 0.8;
      const pluginXp = simulateSuccess ? 10 : 0;
      
      // Record plugin execution
      const { data: logData, error: logError } = await supabase
        .from('plugin_logs')
        .insert({
          plugin_id: plugin.id,
          strategy_id: strategyId,
          tenant_id: tenantId,
          status: simulateSuccess ? 'success' : 'failure',
          input: options || {},
          output: simulateSuccess 
            ? { message: "Plugin executed successfully" }
            : null,
          error: simulateSuccess 
            ? null 
            : "Simulated plugin failure",
          execution_time: Math.random() * 1.5,
          xp_earned: pluginXp,
          execution_id: executionId
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
            strategy_id: strategyId,
            tenant_id: tenantId,
            status: 'failure',
            input: options || {},
            error: pluginError.message || 'Unknown error',
            execution_time: 0.3,
            xp_earned: 0,
            execution_id: executionId
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
  
  return {
    pluginResults,
    xpEarned,
    successfulPlugins,
    completedPluginIds
  };
}

/**
 * Update execution record with retry mechanism
 */
async function updateExecutionRecord(
  supabase: any,
  executionId: string,
  status: string,
  pluginResults: any[],
  executionTime: number,
  xpEarned: number
): Promise<boolean> {
  const MAX_UPDATE_ATTEMPTS = 3;
  let updateAttempt = 0;
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
  
  return updateSuccess;
}

/**
 * Update strategy progress
 */
async function updateStrategyProgress(
  supabase: any,
  strategyId: string,
  status: string,
  currentCompletion: number
): Promise<void> {
  try {
    // Calculate new completion percentage with bounds checking
    const progressIncrement = status === 'success' ? 25 : 10;
    const newCompletion = Math.min(100, Math.max(0, 
      currentCompletion + progressIncrement
    ));
    
    await supabase
      .from('strategies')
      .update({
        completion_percentage: newCompletion,
        updated_at: new Date().toISOString()
      })
      .eq('id', strategyId);
  } catch (updateError) {
    console.error("Error updating strategy progress:", updateError);
  }
}

/**
 * Log system event
 */
async function logSystemEvent(
  supabase: any,
  tenantId: string,
  module: string,
  event: string,
  context: Record<string, any>
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module,
        event,
        context,
        created_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error(`Error logging system event "${event}":`, logError);
  }
}
