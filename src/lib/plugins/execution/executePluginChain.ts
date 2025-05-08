
import { recordExecution } from '@/lib/plugins/execution/recordExecution';
import { ExecutePluginChainOptions, ExecutePluginResult, PluginResult } from '@/types/plugin';

/**
 * Execute a chain of plugins in sequence
 * 
 * @param options Plugin chain execution options
 * @returns Results of the plugin chain execution
 */
export async function executePluginChain(options: ExecutePluginChainOptions): Promise<ExecutePluginResult> {
  const { plugins, inputs, tenant_id, strategy_id, options: executionOptions } = options;
  const startTime = Date.now();
  const results: PluginResult[] = [];
  
  try {
    let currentInput = { ...inputs };
    
    // Execute each plugin in the chain
    for (const plugin of plugins) {
      console.log(`Executing plugin ${plugin.name} (${plugin.id})`);
      
      try {
        // Here we would execute the plugin
        // For now, we'll mock a successful execution
        const pluginResult: PluginResult = {
          success: true,
          data: { result: `${plugin.name} executed successfully` },
          logs: [`${plugin.name} execution started`, `${plugin.name} execution completed`],
          executionTime: 0.5,
          status: 'completed'
        };
        
        // Record the execution in the database
        await recordExecution({
          tenantId: tenant_id,
          pluginId: plugin.id,
          strategyId: strategy_id,
          type: 'plugin',
          status: pluginResult.success ? 'success' : 'failure',
          input: currentInput,
          output: pluginResult.data,
          executionTime: pluginResult.executionTime,
          xpEarned: 10
        });
        
        results.push(pluginResult);
        
        // Pass output of this plugin as input to the next one
        if (pluginResult.data) {
          currentInput = {
            ...currentInput,
            ...pluginResult.data
          };
        }
        
        // If plugin failed, stop the chain
        if (!pluginResult.success) {
          console.error(`Plugin ${plugin.name} failed, stopping chain`);
          break;
        }
      } catch (pluginError: any) {
        console.error(`Error executing plugin ${plugin.name}:`, pluginError);
        
        const errorResult: PluginResult = {
          success: false,
          error: pluginError.message || 'Unknown plugin execution error',
          executionTime: (Date.now() - startTime) / 1000,
          status: 'failed'
        };
        
        results.push(errorResult);
        
        // Record the failed execution
        await recordExecution({
          tenantId: tenant_id,
          pluginId: plugin.id,
          strategyId: strategy_id,
          type: 'plugin',
          status: 'error',
          input: currentInput,
          error: errorResult.error,
          executionTime: errorResult.executionTime
        });
        
        break;
      }
    }
    
    const executionTime = (Date.now() - startTime) / 1000;
    const success = results.every(r => r.success);
    
    return {
      success,
      data: currentInput,
      executionTime,
      chainResults: results,
      status: success ? 'completed' : 'failed'
    };
  } catch (error: any) {
    console.error('Error executing plugin chain:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error in plugin chain execution',
      executionTime: (Date.now() - startTime) / 1000,
      chainResults: results,
      status: 'failed'
    };
  }
}
