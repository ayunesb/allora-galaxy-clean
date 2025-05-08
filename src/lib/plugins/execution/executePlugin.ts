
import { Plugin, PluginResult } from '@/types/plugin';
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a plugin with the provided inputs
 * @param plugin - Plugin to execute
 * @param tenantId - Tenant identifier
 * @param userId - User identifier
 * @param input - Input data for plugin execution
 * @param strategyId - Optional strategy ID for logging
 * @returns The execution result
 */
export async function executePlugin(
  plugin: Plugin,
  tenantId: string,
  userId: string,
  input: Record<string, any>,
  strategyId?: string
): Promise<PluginResult> {
  try {
    // Log plugin execution start
    await logSystemEvent(tenantId, 'plugin', 'plugin_executed', {
      plugin_id: plugin.id,
      plugin_name: plugin.name
    });
    
    // Start measuring execution time
    const startTime = Date.now();
    
    // Execute the plugin logic
    console.log(`Executing plugin ${plugin.name} (${plugin.id})`);
    
    // ... plugin execution logic would go here
    // This is just a placeholder implementation
    const output = { success: true, result: "Plugin execution successful" };
    const xpEarned = 10;
    
    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Log the execution to plugin_logs table
    const { error: logError } = await supabase.from('plugin_logs').insert({
      plugin_id: plugin.id,
      tenant_id: tenantId,
      strategy_id: strategyId,
      status: 'success',
      input,
      output,
      execution_time: executionTime,
      xp_earned: xpEarned
    });
    
    if (logError) {
      console.error('Error logging plugin execution:', logError);
    }
    
    return {
      success: true,
      output,
      executionTime,
      xpEarned
    };
  } catch (error: any) {
    console.error(`Error executing plugin ${plugin.name} (${plugin.id}):`, error);
    
    // Log the error
    await logSystemEvent(tenantId, 'plugin', 'plugin_execution_failed', {
      plugin_id: plugin.id,
      plugin_name: plugin.name,
      error: error.message || 'Unknown error'
    }).catch(err => {
      console.error('Error logging plugin failure:', err);
    });
    
    // Log the failed execution to plugin_logs table
    await supabase.from('plugin_logs').insert({
      plugin_id: plugin.id,
      tenant_id: tenantId,
      strategy_id: strategyId,
      status: 'error',
      input,
      error: error.message || 'Unknown error',
      execution_time: 0,
      xp_earned: 0
    }).catch(err => {
      console.error('Error logging plugin failure to database:', err);
    });
    
    return {
      success: false,
      output: {},
      error: error.message || 'Unknown error',
      executionTime: 0,
      xpEarned: 0
    };
  }
}
