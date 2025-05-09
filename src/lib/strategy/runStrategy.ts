
import { supabase } from '@/integrations/supabase/client';
import { getStrategyExecutionEnv } from '../strategy/utils/environmentUtils';

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id: string;
  status: string;
  execution_time: number;
  error?: string;
  execution_id?: string;
  outputs?: Record<string, any>;
  logs?: Array<any>;
}

/**
 * Shared utility to execute a strategy
 * Can be used by both edge functions and client-side code
 */
export async function runStrategy(input: ExecuteStrategyInput | ExecuteStrategyInputSnakeCase): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  const executionId = crypto.randomUUID();
  
  try {
    // Normalize input to camelCase
    const strategyId = 'strategyId' in input ? input.strategyId : input.strategy_id;
    const tenantId = 'tenantId' in input ? input.tenantId : input.tenant_id;
    const userId = 'userId' in input ? input.userId : input.user_id;
    const options = input.options || {};
    
    // Verify the strategy exists and belongs to the tenant
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id, title, status')
      .eq('id', strategyId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (strategyError || !strategy) {
      throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
    }
    
    if (strategy.status !== 'approved' && strategy.status !== 'pending') {
      throw new Error(`Strategy cannot be executed with status: ${strategy.status}`);
    }
    
    // Record the execution start
    const { error: execError } = await supabase
      .from('executions')
      .insert({
        id: executionId,
        tenant_id: tenantId,
        strategy_id: strategyId,
        executed_by: userId,
        type: 'strategy',
        status: 'pending',
        input: options
      });
    
    if (execError) {
      console.error(`Failed to record execution: ${execError.message}`);
    }
    
    // Get plugins associated with this strategy
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .eq('tenant_id', tenantId)
      .limit(3);  // Just for demonstration
      
    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }
    
    // Execute plugins
    const pluginResults = [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    
    for (const plugin of (plugins || [])) {
      try {
        // In a real implementation, we would execute the plugin's logic
        console.log(`Executing plugin ${plugin.id} for strategy ${strategyId}`);
        
        // Record plugin execution success
        const { data: logData, error: logError } = await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategyId,
            tenant_id: tenantId,
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
        
      } catch (pluginError: any) {
        console.error(`Error executing plugin ${plugin.id}:`, pluginError);
        
        // Record failed plugin execution
        await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: strategyId,
            tenant_id: tenantId,
            status: 'failure',
            input: options || {},
            error: pluginError.message,
            execution_time: 0.3,
            xp_earned: 0
          });
        
        pluginResults.push({
          plugin_id: plugin.id,
          success: false,
          error: pluginError.message,
          xp_earned: 0
        });
      }
    }
    
    // Calculate results
    const executionTime = (performance.now() - startTime) / 1000;
    const pluginCount = plugins ? plugins.length : 0;
    const status = successfulPlugins === pluginCount ? 'success' : 
                  (successfulPlugins > 0 ? 'partial' : 'failure');
    
    // Update the execution record
    await supabase
      .from('executions')
      .update({
        status,
        output: { plugins: pluginResults },
        execution_time: executionTime,
        xp_earned: xpEarned
      })
      .eq('id', executionId);
    
    // Log system event
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module: 'strategy',
        event: 'strategy_executed',
        context: {
          strategy_id: strategyId,
          execution_id: executionId,
          status,
          plugins_executed: pluginCount,
          successful_plugins: successfulPlugins,
          xp_earned: xpEarned
        }
      });
    
    return {
      success: true,
      strategy_id: strategyId,
      status,
      execution_time: executionTime,
      execution_id: executionId,
      outputs: {
        plugins: pluginResults,
        plugins_executed: pluginCount,
        successful_plugins: successfulPlugins,
        xp_earned: xpEarned
      },
      logs: pluginResults
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
      strategy_id: 'strategyId' in input ? input.strategyId : input.strategy_id,
      status: 'failure',
      execution_time: (performance.now() - startTime) / 1000,
      error: error.message
    };
  }
}
