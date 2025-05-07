
import { supabase } from "@/integrations/supabase/client";
import { recordExecution } from "@/lib/executions/recordExecution";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { RunPluginChainResult, PluginResult } from "./types";
import { validateStrategy, fetchPluginsForStrategy, executePlugin } from "./pluginUtils";

/**
 * Runs all plugins associated with a strategy in order based on priority
 * @param strategyId The ID of the strategy to run plugins for
 * @param tenant_id The tenant ID for proper isolation
 * @param user_id The user ID executing this chain (for logging)
 * @returns A result object with success/failure status and details per plugin
 */
export async function runPluginChain(
  strategyId: string,
  tenant_id: string,
  user_id?: string
): Promise<RunPluginChainResult> {
  const startTime = performance.now();
  const results: PluginResult[] = [];
  let totalSuccessful = 0;
  let totalFailed = 0;
  
  try {
    // Validate the strategy exists and belongs to the tenant
    const { valid, strategy, error } = await validateStrategy(strategyId, tenant_id);
    if (!valid) {
      throw new Error(error);
    }
    
    // Log the start of the plugin chain execution
    await logSystemEvent({
      tenant_id,
      module: 'plugins', 
      event: 'plugin_chain_started',
      context: { strategy_id: strategyId }
    });
    
    // Get all plugins associated with this strategy
    const { plugins, error: pluginsError } = await fetchPluginsForStrategy(strategyId);
    
    if (pluginsError) {
      throw new Error(pluginsError);
    }
    
    if (!plugins || plugins.length === 0) {
      // No plugins found for this strategy
      return {
        strategy_id: strategyId,
        success: true,
        results: [],
        total_execution_time: 0,
        total_plugins_run: 0,
        successful_plugins: 0,
        failed_plugins: 0
      };
    }
    
    // Sort plugins by order if available in metadata
    const sortedPlugins = [...plugins].sort((a, b) => {
      const orderA = a.metadata?.order || 0;
      const orderB = b.metadata?.order || 0;
      return orderA - orderB;
    });
    
    // Execute each plugin in order
    for (const plugin of sortedPlugins) {
      if (plugin.status !== 'active') {
        // Skip inactive plugins but log them
        results.push({
          plugin_id: plugin.id,
          name: plugin.name,
          status: 'skipped',
          execution_time: 0,
          xp_earned: 0
        });
        continue;
      }
      
      const pluginResult = await executePlugin(plugin, strategyId, tenant_id);
      results.push(pluginResult);
      
      if (pluginResult.status === 'success') {
        totalSuccessful++;
      } else if (pluginResult.status === 'failure') {
        totalFailed++;
      }
    }
    
    // Record the overall execution
    const executionStatus: 'success' | 'failure' | 'pending' = 
      totalFailed === 0 ? 'success' : 
      (totalSuccessful > 0 ? 'pending' : 'failure');
    
    await recordExecution({
      tenant_id,
      type: 'strategy',
      status: executionStatus,
      strategy_id: strategyId,
      executed_by: user_id,
      execution_time: performance.now() - startTime,
      xp_earned: results.reduce((sum, r) => sum + r.xp_earned, 0)
    });
    
    const endTime = performance.now();
    
    return {
      strategy_id: strategyId,
      success: totalFailed === 0,
      results,
      total_execution_time: endTime - startTime,
      total_plugins_run: results.length,
      successful_plugins: totalSuccessful,
      failed_plugins: totalFailed
    };
    
  } catch (error: any) {
    console.error("Error running plugin chain:", error);
    
    // Log the error
    await logSystemEvent({
      tenant_id,
      module: 'plugins',
      event: 'plugin_chain_error',
      context: { strategy_id: strategyId, error: error.message }
    });
    
    const endTime = performance.now();
    
    return {
      strategy_id: strategyId,
      success: false,
      results,
      total_execution_time: endTime - startTime,
      total_plugins_run: results.length,
      successful_plugins: totalSuccessful,
      failed_plugins: totalFailed
    };
  }
}
