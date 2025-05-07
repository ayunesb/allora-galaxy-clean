import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput, LogStatus } from '@/types/fixed';
import { Plugin } from '@/types/plugin';

/**
 * Record a log execution in the database
 * @param log - Log data
 * @returns The created log record
 */
export async function recordLogExecution(log: {
  tenantId: string;
  pluginId: string;
  strategyId: string;
  agentVersionId: string;
  executedBy: string;
  status: "success" | "failure";
  type: "agent" | "plugin" | "strategy"; // Fix type to match ExecutionRecordInput
  input: Record<string, any>;
  output: any;
  executionTime: number;
  xpEarned: number;
  error: string;
}): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('plugin_logs')
      .insert({
        tenant_id: log.tenantId,
        plugin_id: log.pluginId,
        strategy_id: log.strategyId,
        agent_version_id: log.agentVersionId,
        executed_by: log.executedBy,
        status: log.status,
        type: log.type,
        input: log.input,
        output: log.output,
        execution_time: log.executionTime,
        xp_earned: log.xpEarned,
        error: log.error
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording plugin log:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error recording plugin log:', error);
    throw error;
  }
}

/**
 * Record an execution in the database with retry logic
 * @param input - Execution record input
 * @returns The created execution record
 */
export async function recordExecution(input: ExecutionRecordInput & { id?: string }) {
  // Configuration
  const MAX_RETRY_ATTEMPTS = 3;
  const BASE_RETRY_DELAY = 500; // ms

  let attempt = 0;
  let lastError: any = null;

  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      // If input has an id, update existing record, otherwise insert new one
      let data, error;

      if (input.id) {
        // Update existing record
        const { id, ...updateData } = input; // Extract id from input data
        ({ data, error } = await supabase
          .from('executions')
          .update(updateData)
          .eq('id', id)
          .select()
          .single());
      } else {
        // Create new record
        ({ data, error } = await supabase
          .from('executions')
          .insert(input)
          .select()
          .single());
      }

      if (error) throw error;
      return data;
    } catch (error) {
      lastError = error;
      attempt++;

      // Log the retry attempt
      console.warn(`Error recording execution (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error);

      if (attempt < MAX_RETRY_ATTEMPTS) {
        // Exponential backoff with jitter
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error(`Failed to record execution after ${MAX_RETRY_ATTEMPTS} attempts:`, lastError);
  throw lastError || new Error(`Failed to record execution after ${MAX_RETRY_ATTEMPTS} attempts`);
}

/**
 * Interface for plugin execution result
 */
export interface PluginResult {
  pluginId: string;
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

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
  let result: PluginResult = {
    pluginId: plugin.id,
    success: false
  };

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
      pluginId: plugin.id,
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
        output: {},
        executionTime: (performance.now() - startTime) / 1000,
        xpEarned: 0,
        error: pluginError.message
      });
    } catch (logError) {
      console.error("Error recording plugin failure:", logError);
    }

    result = {
      pluginId: plugin.id,
      success: false,
      error: pluginError.message
    };
  }

  return result;
}

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
    type: "plugin" as const, // Use 'plugin' instead of 'plugin_chain'
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

/**
 * Get all active plugins
 * @returns Array of active plugins
 */
export async function getActivePlugins(): Promise<Plugin[]> {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error getting active plugins:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting active plugins:', error);
    return [];
  }
}
