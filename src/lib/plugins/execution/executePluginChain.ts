
import { Plugin, PluginResult, RunPluginChainResult } from '@/types/plugin';
import { executePlugin } from './executePlugin';
import { ExecutionParams } from '@/types/shared';

/**
 * Execute a chain of plugins in sequence
 * @param plugins - Array of plugins to execute
 * @param agentVersions - Array of agent versions
 * @param initialInput - Initial input data
 * @param strategy - Strategy data
 * @param params - Execution parameters
 * @returns The execution results
 */
export async function executePluginChain(
  plugins: Plugin[],
  agentVersions: any[],
  initialInput: Record<string, any>,
  strategy: any,
  params: {
    tenant_id: string;
    user_id?: string;
    dryRun?: boolean;
  }
): Promise<RunPluginChainResult> {
  // Validate input
  if (!plugins || plugins.length === 0) {
    return {
      success: false,
      results: [],
      error: 'No plugins provided'
    };
  }

  if (!params.tenant_id) {
    return {
      success: false,
      results: [],
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
      const result = await executePlugin(
        plugin,
        params.tenant_id,
        params.user_id || 'system',
        currentInput,
        strategy?.id || 'unknown'
      );
      
      // Add result to results array
      results.push(result);
      
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
