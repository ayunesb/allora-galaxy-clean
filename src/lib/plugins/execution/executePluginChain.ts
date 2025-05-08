
import { Plugin, PluginResult, RunPluginChainInput, RunPluginChainResult } from '@/types/plugin';
import { AgentVersion } from '@/types/agent';
import { Strategy } from '@/types/strategy';
import { ExecutionParams, LogStatus } from '@/types/shared';
import { recordExecution } from '@/lib/executions/recordExecution';

/**
 * Executes a plugin with optional execution context
 * @param plugin The plugin to execute
 * @param input Input data for the plugin
 * @param context Execution context
 * @returns Result of plugin execution
 */
async function executePlugin(
  plugin: Plugin,
  agentVersion: AgentVersion,
  input: any,
  params: ExecutionParams,
  strategy?: Strategy
): Promise<PluginResult> {
  console.log(`Executing plugin ${plugin.name} with version ${agentVersion.version}`);
  
  const startTime = performance.now();
  let status: 'success' | 'failure' = 'success';
  let result: any = null;
  let error: string | null = null;
  let xpEarned = 0;
  
  try {
    // Mock plugin execution - in a real app this would call an API or edge function
    result = {
      output: `Executed ${plugin.name} with input: ${JSON.stringify(input)}`,
      success: true
    };
    xpEarned = Math.floor(Math.random() * 50) + 10;
  } catch (err: any) {
    console.error(`Error executing plugin ${plugin.name}:`, err);
    status = 'failure';
    error = err.message || 'Unknown error during plugin execution';
  }
  
  const executionTime = performance.now() - startTime;
  
  // Record the execution for tracking
  await recordExecution({
    tenantId: params.tenant_id,
    status: status,
    type: 'plugin',
    pluginId: plugin.id,
    agentVersionId: agentVersion.id,
    strategyId: strategy?.id,
    executedBy: params.user_id,
    input,
    output: result,
    executionTime,
    xpEarned,
    error: error
  });
  
  return {
    success: status === 'success',
    output: result,
    error,
    executionTime,
    xpEarned
  };
}

/**
 * Executes a chain of plugins in sequence, with output from one feeding into the next
 * @param input The input for the plugin chain execution
 * @returns Result of the plugin chain execution
 */
export async function executePluginChain(
  input: RunPluginChainInput
): Promise<RunPluginChainResult> {
  console.log('Starting plugin chain execution');
  
  const { 
    plugins, 
    agentVersions,
    initialInput, 
    strategy,
    params
  } = input;
  
  const results: PluginResult[] = [];
  let currentInput = initialInput;
  let success = true;
  
  // Execute each plugin in sequence
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const agentVersion = agentVersions[i];
    
    console.log(`Executing plugin ${i + 1} of ${plugins.length}: ${plugin.name}`);
    
    // Execute the current plugin
    const result = await executePlugin(
      plugin,
      agentVersion,
      currentInput,
      params,
      strategy
    );
    
    results.push(result);
    
    // Stop the chain if a plugin fails
    if (!result.success) {
      console.error(`Plugin ${plugin.name} failed, stopping chain`);
      success = false;
      break;
    }
    
    // Use the output as input to the next plugin
    currentInput = result.output;
  }
  
  return {
    success,
    results,
    finalOutput: results.length > 0 ? results[results.length - 1].output : null,
  };
}
