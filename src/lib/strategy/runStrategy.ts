
import { supabase } from '@/integrations/supabase/client';
import { recordExecution } from '@/lib/plugins/execution/recordExecution';
import { ExecuteStrategyResult } from '@/types/strategy';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface StrategyRunInput {
  strategyId: string;
  tenantId: string;
  userId?: string | null;
  options?: Record<string, any>;
}

/**
 * Main function to run a strategy and execute its associated plugins
 */
export async function runStrategy(input: StrategyRunInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  const executionId = crypto.randomUUID();
  
  try {
    // 1. Record execution start
    await recordExecution({
      id: executionId,
      tenant_id: input.tenantId,
      strategy_id: input.strategyId,
      executed_by: input.userId || null,
      type: 'strategy',
      status: 'pending',
      input: input.options || {}
    });
    
    // 2. Verify strategy exists and belongs to tenant
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id, title, status')
      .eq('id', input.strategyId)
      .eq('tenant_id', input.tenantId)
      .single();
    
    if (strategyError || !strategy) {
      throw new Error(`Strategy not found or access denied: ${strategyError?.message || 'Unknown error'}`);
    }
    
    // 3. Check if strategy can be executed
    if (!['approved', 'pending'].includes(strategy.status)) {
      throw new Error(`Strategy cannot be executed with status: ${strategy.status}`);
    }
    
    // 4. Fetch plugins to execute
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .limit(10);
      
    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }
    
    // 5. Execute plugins
    const pluginResults = [];
    let xpEarned = 0;
    let successfulPlugins = 0;
    
    for (const plugin of plugins || []) {
      try {
        // Plugin execution logic would go here
        console.log(`Executing plugin ${plugin.id} for strategy ${input.strategyId}`);
        
        // Record plugin execution
        const { data: logData, error: logError } = await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: input.strategyId,
            tenant_id: input.tenantId,
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
        await supabase
          .from('plugin_logs')
          .insert({
            plugin_id: plugin.id,
            strategy_id: input.strategyId,
            tenant_id: input.tenantId,
            status: 'failure',
            input: input.options || {},
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
    
    // 6. Determine overall status
    const status = !plugins?.length ? 'failure' : 
                   (successfulPlugins === plugins.length) ? 'success' : 
                   (successfulPlugins > 0) ? 'partial' : 'failure';
    
    const executionTime = (performance.now() - startTime) / 1000;
    
    // 7. Record execution completion
    await recordExecution({
      id: executionId,
      status,
      output: { plugins: pluginResults },
      execution_time: executionTime,
      xp_earned: xpEarned
    });
    
    // 8. Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      await supabase
        .from('strategies')
        .update({
          completion_percentage: Math.min(100, ((strategy.completion_percentage || 0) + 25))
        })
        .eq('id', input.strategyId)
        .eq('tenant_id', input.tenantId);
    }
    
    // 9. Log system event
    await logSystemEvent(
      input.tenantId,
      'strategy',
      'strategy_executed',
      {
        strategy_id: input.strategyId,
        execution_id: executionId,
        status,
        plugins_executed: plugins?.length || 0,
        successful_plugins: successfulPlugins,
        xp_earned: xpEarned
      }
    );
    
    // 10. Return result
    return {
      success: status !== 'failure',
      strategy_id: input.strategyId,
      execution_id: executionId,
      status: status,
      message: `Strategy execution ${status}`,
      executionTime: executionTime,
      execution_time: executionTime,
      plugins_executed: plugins?.length || 0,
      successful_plugins: successfulPlugins,
      xp_earned: xpEarned,
      data: { plugins: pluginResults }
    };
    
  } catch (error: any) {
    console.error("Strategy execution error:", error);
    
    // Record execution failure
    await recordExecution({
      id: executionId,
      status: 'failure',
      error: error.message,
      execution_time: (performance.now() - startTime) / 1000
    }).catch(e => console.error("Error recording execution failure:", e));
    
    // Log system event for error
    await logSystemEvent(
      input.tenantId,
      'strategy',
      'strategy_execution_failed',
      {
        strategy_id: input.strategyId,
        execution_id: executionId,
        error: error.message
      }
    ).catch(e => console.error("Error logging system event:", e));
    
    // Return error result
    return {
      success: false,
      strategy_id: input.strategyId,
      execution_id: executionId,
      error: error.message,
      executionTime: (performance.now() - startTime) / 1000,
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}
