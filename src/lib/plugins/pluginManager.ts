
import { supabase } from "@/integrations/supabase/client";
import { recordExecution } from "@/lib/executions/recordExecution";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { notifyError, notifySuccess } from "@/components/ui/BetterToast";
import { PluginResult, RunPluginChainResult, LogStatus } from "@/types/fixed";
import { validateStrategy, fetchPluginsForStrategy, executePlugin, PluginFunction } from "./pluginUtils";

/**
 * Runs all plugins associated with a strategy in order based on priority
 * @param strategyId The ID of the strategy to run plugins for
 * @param tenantId The tenant ID for proper isolation
 * @param userId The user ID executing this chain (for logging)
 * @returns A result object with success/failure status and details per plugin
 */
export async function runPluginChain(
  strategyId: string,
  tenantId: string,
  userId?: string
): Promise<RunPluginChainResult> {
  const startTime = performance.now();
  const results: PluginResult[] = [];
  let totalSuccessful = 0;
  let totalFailed = 0;
  
  try {
    // Validate the strategy exists and belongs to the tenant
    const { valid, strategy, error } = await validateStrategy(strategyId, tenantId);
    if (!valid) {
      throw new Error(error || 'Strategy validation failed');
    }
    
    // Log the start of the plugin chain execution
    await logSystemEvent(
      tenantId,
      'plugins', 
      'plugin_chain_started',
      { strategyId }
    );
    
    // Get all plugins associated with this strategy
    const { plugins, error: pluginsError } = await fetchPluginsForStrategy(strategyId);
    
    if (pluginsError) {
      throw new Error(pluginsError);
    }
    
    if (!plugins || plugins.length === 0) {
      // No plugins found for this strategy
      notifySuccess("Strategy Execution", "Strategy has no plugins to execute");
      return {
        success: true,
        results: [],
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
      try {
        if (plugin.status !== 'active') {
          // Skip inactive plugins but log them
          results.push({
            pluginId: plugin.id,
            status: 'pending' as LogStatus, // Use pending as a fallback for skipped
            executionTime: 0,
            xpEarned: 0
          });
          continue;
        }
        
        // Create a mock plugin function for this example
        const mockPluginFn: PluginFunction = async (input) => {
          // Mock implementation
          return { success: true, result: `Executed ${plugin.name}` };
        };
        
        const pluginResult = await executePlugin(plugin.id, mockPluginFn, { strategyId });
        results.push(pluginResult);
        
        if (pluginResult.status === 'success') {
          totalSuccessful++;
        } else if (pluginResult.status === 'failure') {
          totalFailed++;
        }
      } catch (pluginError: any) {
        // Handle individual plugin errors without breaking the chain
        console.error(`Error executing plugin ${plugin.name}:`, pluginError);
        
        results.push({
          pluginId: plugin.id,
          status: 'failure',
          executionTime: 0,
          error: pluginError.message || 'Unknown error during plugin execution',
          xpEarned: 0
        });
        
        totalFailed++;
      }
    }
    
    // Record the overall execution
    const executionStatus: LogStatus = 
      totalFailed === 0 ? 'success' : 
      (totalSuccessful > 0 ? 'pending' : 'failure');
    
    await recordExecution({
      tenantId,
      type: 'strategy',
      status: executionStatus,
      strategyId,
      executedBy: userId,
      executionTime: performance.now() - startTime,
      xpEarned: results.reduce((sum, r) => sum + r.xpEarned, 0)
    }).catch(err => {
      console.error("Failed to record execution, but continuing:", err);
    });
    
    const endTime = performance.now();
    
    // Notify user of results
    if (executionStatus === 'success') {
      notifySuccess(
        "Strategy Executed Successfully", 
        `All ${totalSuccessful} plugins completed successfully`
      );
    } else if (executionStatus === 'pending') {
      notifySuccess(
        "Strategy Partially Executed", 
        `${totalSuccessful} plugins completed, ${totalFailed} failed`
      );
    } else {
      notifyError(
        "Strategy Execution Failed",
        `All ${totalFailed} plugins failed to execute`
      );
    }
    
    return {
      success: totalFailed === 0,
      results,
    };
    
  } catch (error: any) {
    console.error("Error running plugin chain:", error);
    
    // Log the error
    await logSystemEvent(
      tenantId,
      'plugins',
      'plugin_chain_error',
      { strategyId, error: error.message }
    );
    
    // Notify the user
    notifyError(
      "Strategy Execution Failed", 
      error.message || "An unexpected error occurred"
    );
    
    return {
      success: false,
      results,
      error: error.message
    };
  }
}
