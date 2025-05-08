
import { executePlugin } from './executePlugin';
import { Plugin, PluginResult } from '@/types/plugin';
import { recordExecution } from './recordExecution';
import { LogStatus } from '@/types/shared';

export interface PluginChainOptions {
  tenantId: string;
  userId?: string;
  strategyId?: string;
  recordResults?: boolean;
  context?: Record<string, any>;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  erroredAt?: number;
  error?: string;
}

/**
 * Executes a chain of plugins in sequence
 * 
 * @param plugins Array of plugins to execute
 * @param initialInput Input data for the first plugin
 * @param options Chain execution options
 * @returns Result of the chain execution
 */
export async function executePluginChain(
  plugins: Plugin[],
  initialInput: any,
  options: PluginChainOptions
): Promise<RunPluginChainResult> {
  const results: PluginResult[] = [];
  let currentInput = initialInput;
  
  try {
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      
      try {
        // Execute the current plugin
        const result = await executePlugin(plugin, currentInput, {
          tenantId: options.tenantId,
          userId: options.userId,
          context: { ...options.context, chainPosition: i }
        });
        
        // Record execution if requested
        if (options.recordResults && options.tenantId) {
          await recordExecution({
            tenantId: options.tenantId,
            status: result.success ? 'success' : 'failed',
            type: 'plugin',
            pluginId: plugin.id,
            strategyId: options.strategyId,
            executedBy: options.userId,
            input: currentInput,
            output: result.data,
            executionTime: result.executionTime,
            xpEarned: result.xpEarned,
            error: result.success ? undefined : result.error
          });
        }
        
        // Store result
        results.push(result);
        
        // Use this plugin's output as input to the next plugin
        if (result.success) {
          currentInput = result.data;
        } else {
          // If any plugin fails, stop the chain
          return {
            success: false,
            results,
            erroredAt: i,
            error: result.error
          };
        }
      } catch (error: any) {
        // Handle unexpected errors
        const errorMessage = `Unexpected error in plugin ${plugin.name || plugin.id}: ${error.message}`;
        
        // Record failure if requested
        if (options.recordResults && options.tenantId) {
          await recordExecution({
            tenantId: options.tenantId,
            status: 'error',
            type: 'plugin',
            pluginId: plugin.id,
            strategyId: options.strategyId,
            executedBy: options.userId,
            input: currentInput,
            error: errorMessage
          });
        }
        
        // Add failure result
        results.push({
          success: false,
          error: errorMessage,
          executionTime: 0,
          plugin: plugin
        });
        
        // Return chain failure
        return {
          success: false,
          results,
          erroredAt: i,
          error: errorMessage
        };
      }
    }
    
    // If all plugins executed successfully
    return {
      success: true,
      results
    };
  } catch (error: any) {
    // Handle unexpected errors in the chain execution itself
    return {
      success: false,
      results,
      error: `Chain execution error: ${error.message}`
    };
  }
}
