
import { ExecutePluginChainOptions, ExecutePluginResult } from '@/types/plugin';
import { executePlugin } from './executePlugin';

/**
 * Executes a chain of plugins in sequence, passing outputs as inputs to subsequent plugins
 * @param options Configuration for plugin chain execution
 * @returns Promise resolving to results of the plugin chain execution
 */
export async function executePluginChain(
  options: ExecutePluginChainOptions
): Promise<ExecutePluginResult[]> {
  const { plugins, initialInput, tenant_id, trace_id } = options;
  const results: ExecutePluginResult[] = [];
  let currentInput = initialInput;
  let success = true;
  
  console.log(`[executePluginChain] Starting chain execution with ${plugins.length} plugins`);
  
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const isLastPlugin = i === plugins.length - 1;
    
    console.log(`[executePluginChain] Executing plugin ${i + 1}/${plugins.length}: ${plugin.name || plugin.id}`);
    
    try {
      // Execute the current plugin with the input from the previous plugin (or the initial input)
      const result = await executePlugin({
        plugin_id: plugin.id,
        tenant_id,
        input: currentInput,
        trace_id,
      });
      
      results.push(result);
      
      // If any plugin fails, break the chain (unless configured to continue)
      if (result.status !== 'success' && !options.continueOnError) {
        console.log(`[executePluginChain] Plugin ${plugin.id} failed, breaking chain`);
        success = false;
        break;
      }
      
      // Update the input for the next plugin in the chain
      if (!isLastPlugin && result.output) {
        currentInput = {
          ...currentInput,
          ...result.output,
        };
      }
    } catch (error: any) {
      console.error(`[executePluginChain] Error executing plugin ${plugin.id}:`, error);
      
      // Add the error to the results and break the chain
      results.push({
        plugin_id: plugin.id,
        tenant_id,
        trace_id,
        status: 'error',
        input: currentInput,
        error: error.message || 'Unknown error',
        execution_time: 0,
      });
      
      success = false;
      if (!options.continueOnError) {
        break;
      }
    }
  }
  
  console.log(`[executePluginChain] Chain execution completed with status: ${success ? 'success' : 'error'}`);
  
  return results;
}
