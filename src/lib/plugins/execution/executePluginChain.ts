
import { Plugin, PluginResult, RunPluginChainResult } from '@/types/plugin';
import { executePlugin } from './executePlugin';

/**
 * Execute a chain of plugins in sequence
 * @param plugins - Array of plugins to execute
 * @param initialInput - Initial input data
 * @param strategy - Strategy data
 * @param params - Execution parameters
 * @returns The execution results
 */
export async function executePluginChain(
  plugins: Plugin[],
  initialInput: Record<string, any>,
  strategy: any,
  params: {
    tenant_id: string;
    user_id: string;
    dryRun?: boolean;
  }
): Promise<RunPluginChainResult> {
  // Validate input
  if (!plugins || plugins.length === 0) {
    return {
      success: false,
      results: [],
      output: {},
      error: 'No plugins provided'
    };
  }

  if (!params.tenant_id) {
    return {
      success: false,
      results: [],
      output: {},
      error: 'Tenant ID is required'
    };
  }

  // Initialize the results array and current input
  const results: PluginResult[] = [];
  let currentInput = { ...initialInput };
  let allSuccess = true;

  // Execute each plugin in sequence
  for (const plugin of plugins) {
    try {
      console.log(`Executing plugin ${plugin.id} in chain`);
      
      // Execute the plugin
      const result = await executePlugin({
        pluginId: plugin.id,
        tenantId: params.tenant_id,
        userId: params.user_id,
        input: currentInput,
        strategyId: strategy?.id
      });
      
      // Convert ExecutePluginResult to PluginResult
      const pluginResult: PluginResult = {
        pluginId: result.pluginId,
        success: result.success,
        output: result.output || {},
        error: result.error,
        executionTime: result.executionTime,
        xpEarned: result.xpEarned
      };
      
      // Add result to results array
      results.push(pluginResult);
      
      // Update success flag
      if (!result.success) {
        allSuccess = false;
      }
      
      // Update input for next plugin if this one was successful
      if (result.success) {
        currentInput = {
          ...currentInput,
          previousOutput: result.output
        };
      }
    } catch (error: any) {
      console.error(`Error executing plugin ${plugin.id} in chain:`, error);
      
      // Add error result to results array
      results.push({
        pluginId: plugin.id,
        success: false,
        output: {},
        error: error.message,
        executionTime: 0,
        xpEarned: 0
      });
      
      // Update success flag
      allSuccess = false;
    }
  }

  // Return the final result
  return {
    success: allSuccess,
    results,
    output: currentInput
  };
}
