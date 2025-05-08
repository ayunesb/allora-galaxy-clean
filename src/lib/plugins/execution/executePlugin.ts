
import { Plugin, PluginResult } from '@/types/plugin';
import { recordLogExecution } from '../logging/recordLogExecution';

/**
 * Execute a single plugin
 * @param plugin - Plugin to execute
 * @param tenantId - Tenant ID
 * @param executedBy - User ID of the user who executed the plugin
 * @param input - Input data for the plugin
 * @param strategyId - Strategy ID
 * @returns The plugin execution result
 */
export async function executePlugin(
  plugin: Plugin,
  tenantId: string,
  executedBy: string,
  input: Record<string, any>,
  strategyId: string
): Promise<PluginResult> {
  const startTime = performance.now();
  let result: PluginResult;

  try {
    // In a real implementation, we would execute the plugin's logic
    console.log(`Executing plugin ${plugin.id} for strategy ${strategyId}`);

    // Simulate plugin execution
    const output = { message: "Plugin executed successfully" };
    const executionTime = (performance.now() - startTime) / 1000; // Convert to seconds
    const xpEarned = 10;

    // Record plugin execution
    const logData = await recordLogExecution({
      tenantId,
      pluginId: plugin.id,
      strategyId,
      agentVersionId: 'n/a', // not applicable for plugins
      executedBy,
      status: 'success',
      type: 'plugin',
      input,
      output,
      executionTime,
      xpEarned,
      error: ''
    });

    result = {
      success: true,
      output: logData,
      executionTime,
      xpEarned
    };

  } catch (pluginError: any) {
    console.error(`Error executing plugin ${plugin.id}:`, pluginError);

    // Record failed plugin execution
    try {
      await recordLogExecution({
        tenantId,
        pluginId: plugin.id,
        strategyId,
        agentVersionId: 'n/a', // not applicable for plugins
        executedBy,
        status: 'failure',
        type: 'plugin',
        input,
        output: {}, // Empty object as output for failed execution
        executionTime: (performance.now() - startTime) / 1000,
        xpEarned: 0,
        error: pluginError.message
      });
    } catch (logError) {
      console.error("Error recording plugin failure:", logError);
    }

    result = {
      success: false,
      output: {}, // Empty object as output for failed execution
      error: pluginError.message
    };
  }

  return result;
}
