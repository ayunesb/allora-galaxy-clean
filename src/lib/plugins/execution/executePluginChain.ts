
import { Plugin, PluginResult } from '@/types/plugin';
import { executePlugin } from './executePlugin';
import { recordExecution } from './recordExecution';

/**
 * Execute a chain of plugins
 * @param plugins - Plugins to execute
 * @param tenantId - Tenant ID
 * @param executedBy - User ID of the user who executed the plugin
 * @param input - Input data for the plugin
 * @param strategyId - Strategy ID
 * @returns The chain execution result
 */
export async function executePluginChain(
  plugins: Plugin[],
  tenantId: string,
  executedBy: string,
  input: Record<string, any>,
  strategyId: string
): Promise<{
  success: boolean;
  results: PluginResult[];
  error?: string;
}> {
  const startTime = performance.now();
  const results: PluginResult[] = [];
  let chainError: any = null;
  let xpEarned = 0;
  let success = true;

  for (const plugin of plugins) {
    try {
      const pluginResult = await executePlugin(plugin, tenantId, executedBy, input, strategyId);
      results.push(pluginResult);

      if (!pluginResult.success) {
        success = false;
        chainError = new Error(`Plugin ${plugin.id} failed: ${pluginResult.error}`);
        break; // Stop the chain if a plugin fails
      } else {
        xpEarned += pluginResult.xpEarned || 0;
      }
    } catch (error: any) {
      success = false;
      chainError = error;
      break; // Stop the chain if there's an unhandled error
    }
  }

  const executionTime = (performance.now() - startTime) / 1000;

  await recordExecution({
    tenantId,
    type: "plugin" as const,
    status: success ? 'success' : 'failure',
    pluginId: plugins[0]?.id, // Use first plugin ID
    strategyId,
    executedBy,
    input,
    output: results,
    executionTime,
    xpEarned,
    error: chainError?.message
  });

  return {
    success,
    results,
    error: chainError?.message
  };
}
