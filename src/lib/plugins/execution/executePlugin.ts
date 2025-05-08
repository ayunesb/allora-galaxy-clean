
import { supabase } from '@/integrations/supabase/client';
import { Plugin, PluginResult } from '@/types/plugin';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a plugin and record the execution
 * @param plugin - The plugin to execute
 * @param tenantId - The tenant ID
 * @param userId - The user ID
 * @param input - Input data for the plugin
 * @param strategyId - Strategy ID if running as part of a strategy
 * @returns The execution result
 */
export async function executePlugin(
  plugin: Plugin,
  tenantId: string,
  userId: string,
  input: Record<string, any> = {},
  strategyId?: string
): Promise<PluginResult> {
  // Validate input
  if (!plugin || !plugin.id) {
    return {
      success: false,
      output: {},
      error: 'Invalid plugin',
      executionTime: 0,
      xpEarned: 0
    };
  }

  if (!tenantId) {
    return {
      success: false,
      output: {},
      error: 'Tenant ID is required',
      executionTime: 0,
      xpEarned: 0
    };
  }

  try {
    console.log(`Executing plugin ${plugin.name} (${plugin.id})...`);
    const startTime = Date.now();
    
    // Log the execution start
    await logSystemEvent(
      tenantId,
      'plugin',
      'plugin_executed',
      {
        plugin_id: plugin.id,
        strategy_id: strategyId,
        input
      }
    );
    
    // Execute the plugin (simulated for now)
    let success = true;
    let output = { result: `Executed ${plugin.name}` };
    let xpEarned = Math.floor(Math.random() * 10) + 1;
    
    // Record the plugin execution in the database
    await supabase
      .from('plugin_logs')
      .insert({
        plugin_id: plugin.id,
        tenant_id: tenantId,
        strategy_id: strategyId,
        status: success ? 'success' : 'error',
        input,
        output,
        execution_time: (Date.now() - startTime) / 1000,
        xp_earned: xpEarned
      });
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    return {
      success,
      output,
      executionTime,
      xpEarned
    };
  } catch (error: any) {
    console.error(`Error executing plugin ${plugin.id}:`, error);
    
    try {
      // Log the execution error
      await logSystemEvent(
        tenantId,
        'plugin',
        'plugin_execution_failed',
        {
          plugin_id: plugin.id,
          strategy_id: strategyId,
          error: error.message
        }
      );
      
      // Record the failed execution in the database
      await supabase
        .from('plugin_logs')
        .insert({
          plugin_id: plugin.id,
          tenant_id: tenantId,
          strategy_id: strategyId,
          status: 'error',
          input,
          error: error.message,
          execution_time: 0,
          xp_earned: 0
        });
    } catch (logError) {
      console.error('Failed to log plugin execution error:', logError);
    }
    
    return {
      success: false,
      output: {},
      error: error.message || 'Unknown error',
      executionTime: 0,
      xpEarned: 0
    };
  }
}
