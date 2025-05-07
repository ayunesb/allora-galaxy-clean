
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
    ).catch(err => {
      console.warn('Failed to log plugin chain start:', err);
      // Continue even if logging fails
    });
    
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
    
    // Create execution record to track overall progress
    let executionId: string | null = null;
    try {
      const executionRecord = await recordExecution({
        tenantId,
        type: 'strategy',
        status: 'pending',
        strategyId,
        executedBy: userId,
        executionTime: 0,
        xpEarned: 0
      });
      executionId = executionRecord?.id;
    } catch (execError) {
      console.warn("Failed to create execution record, continuing:", execError);
    }
    
    // Execute each plugin in order with dependency tracking
    const completedPluginIds = new Set<string>();
    for (const plugin of sortedPlugins) {
      try {
        if (plugin.status !== 'active') {
          // Skip inactive plugins but log them
          results.push({
            pluginId: plugin.id,
            status: 'skipped' as LogStatus,
            executionTime: 0,
            xpEarned: 0,
            message: `Plugin skipped - status is ${plugin.status}`
          });
          continue;
        }
        
        // Check if dependencies are satisfied (if any)
        const dependencies = plugin.metadata?.dependencies || [];
        const unsatisfiedDependencies = dependencies.filter(
          (depId: string) => !completedPluginIds.has(depId)
        );
        
        if (unsatisfiedDependencies.length > 0) {
          results.push({
            pluginId: plugin.id,
            status: 'failure',
            executionTime: 0,
            error: `Unsatisfied dependencies: ${unsatisfiedDependencies.join(', ')}`,
            xpEarned: 0
          });
          totalFailed++;
          continue;
        }
        
        // Create a plugin function (in a real implementation this would be from the plugin system)
        const mockPluginFn: PluginFunction = async (input) => {
          // Mock implementation - in real code this would execute the actual plugin logic
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
          return { success: true, result: `Executed ${plugin.name}` };
        };
        
        // Execute the plugin with automatic retries
        const maxRetries = plugin.metadata?.maxRetries || 0;
        let attempt = 0;
        let pluginResult: PluginResult | null = null;
        let lastError: Error | null = null;
        
        while (attempt <= maxRetries) {
          try {
            pluginResult = await executePlugin(plugin.id, mockPluginFn, { 
              strategyId,
              previousResults: [...results],
              attempt
            });
            break; // Success, exit retry loop
          } catch (pluginError: any) {
            lastError = pluginError;
            attempt++;
            
            if (attempt <= maxRetries) {
              // Wait before retry with exponential backoff
              await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
              continue;
            }
            
            // Max retries reached
            pluginResult = {
              pluginId: plugin.id,
              status: 'failure',
              error: `Failed after ${attempt} attempts: ${pluginError.message}`,
              executionTime: 0,
              xpEarned: 0
            };
          }
        }
        
        if (!pluginResult) {
          // This should never happen, but just in case
          pluginResult = {
            pluginId: plugin.id,
            status: 'failure',
            error: lastError?.message || 'Unknown error during execution',
            executionTime: 0,
            xpEarned: 0
          };
        }
        
        results.push(pluginResult);
        
        if (pluginResult.status === 'success') {
          totalSuccessful++;
          completedPluginIds.add(plugin.id);
        } else if (pluginResult.status === 'failure') {
          totalFailed++;
        }
        
        // Log individual plugin execution
        await logSystemEvent(
          tenantId,
          'plugins',
          `plugin_execution_${pluginResult.status}`,
          { 
            strategyId,
            pluginId: plugin.id,
            executionTime: pluginResult.executionTime,
            xpEarned: pluginResult.xpEarned
          }
        ).catch(err => {
          console.warn('Failed to log plugin execution:', err);
        });
        
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
    
    // Determine overall status
    const executionStatus: LogStatus = 
      totalFailed === 0 ? 'success' : 
      (totalSuccessful > 0 ? 'partial' : 'failure');
    
    const totalExecutionTime = performance.now() - startTime;
    const totalXp = results.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
    
    // Update the execution record if we created one
    if (executionId) {
      await recordExecution({
        id: executionId,
        tenantId,
        type: 'strategy',
        status: executionStatus,
        strategyId,
        executedBy: userId,
        executionTime: totalExecutionTime,
        xpEarned: totalXp,
        output: { results }
      }).catch(err => {
        console.error("Failed to update execution record:", err);
      });
    }
    
    // Notify user of results
    if (executionStatus === 'success') {
      notifySuccess(
        "Strategy Executed Successfully", 
        `All ${totalSuccessful} plugins completed successfully`
      );
    } else if (executionStatus === 'partial') {
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
      executionTime: totalExecutionTime / 1000, // Convert to seconds
      xpEarned: totalXp
    };
    
  } catch (error: any) {
    console.error("Error running plugin chain:", error);
    
    // Log the error
    await logSystemEvent(
      tenantId,
      'plugins',
      'plugin_chain_error',
      { strategyId, error: error.message }
    ).catch(err => {
      console.warn('Failed to log plugin chain error:', err);
    });
    
    // Notify the user
    notifyError(
      "Strategy Execution Failed", 
      error.message || "An unexpected error occurred"
    );
    
    return {
      success: false,
      results,
      error: error.message,
      executionTime: (performance.now() - startTime) / 1000
    };
  }
}
