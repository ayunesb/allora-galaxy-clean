
import { recordLogExecution } from '../logging/recordLogExecution';
import { PluginResult, RunPluginChainResult } from '@/types/plugin';
import { supabase } from '@/integrations/supabase/client';
import logSystemEvent from '@/lib/system/logSystemEvent';

/**
 * Execute a single plugin
 * 
 * @param pluginId The ID of the plugin to execute
 * @param input The input data for the plugin
 * @param tenantId The tenant ID
 * @param options Additional options for execution
 * @returns Result of the plugin execution
 */
async function executePlugin(
  pluginId: string,
  input: Record<string, any>,
  tenantId: string,
  options: { 
    strategyId?: string; 
    agentVersionId?: string;
    timeout?: number;
  } = {}
): Promise<PluginResult> {
  try {
    const startTime = performance.now();
    
    // Fetch the plugin from the database
    const { data: plugin, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', pluginId)
      .single();
    
    if (error) {
      throw new Error(`Plugin not found: ${error.message}`);
    }
    
    if (plugin.status !== 'active') {
      throw new Error(`Plugin is not active: ${plugin.status}`);
    }
    
    // In a real implementation, this would call the actual plugin logic
    // For this example, we'll simulate a successful execution with mock output
    
    // Simulate plugin processing time (between 0.3 and 1.5 seconds)
    const processingTime = Math.random() * 1.2 + 0.3;
    
    // Wait for the simulated processing time
    await new Promise(resolve => setTimeout(resolve, processingTime * 1000));
    
    // Generate a mock output
    const output = {
      message: `Successfully executed plugin: ${plugin.name}`,
      timestamp: new Date().toISOString(),
      data: {
        result: `Sample result from ${plugin.name}`,
        metrics: {
          accuracy: Math.random() * 100,
          confidence: Math.random() * 100
        }
      }
    };
    
    const executionTime = (performance.now() - startTime) / 1000; // Convert to seconds
    const xpEarned = Math.floor(Math.random() * 20) + 5; // Random XP between 5 and 25
    
    // Record the successful execution in the database
    await recordLogExecution({
      pluginId,
      tenantId,
      strategyId: options.strategyId,
      agentVersionId: options.agentVersionId,
      status: 'success',
      input,
      output,
      executionTime,
      xpEarned
    });
    
    // Return the result
    return {
      success: true,
      pluginId,
      status: 'success',
      output,
      executionTime,
      xpEarned // Match the property name with the interface
    };
  } catch (error: any) {
    console.error(`Error executing plugin ${pluginId}:`, error);
    
    // Record the failed execution in the database
    try {
      await recordLogExecution({
        pluginId,
        tenantId,
        strategyId: options.strategyId,
        agentVersionId: options.agentVersionId,
        status: 'failure',
        input,
        error: error.message,
        executionTime: 0,
        xpEarned: 0
      });
    } catch (logError) {
      console.error('Failed to record plugin execution error:', logError);
    }
    
    // Return the error result
    return {
      success: false,
      pluginId,
      status: 'failure',
      error: error.message,
      xpEarned: 0 // Match the property name with the interface
    };
  }
}

/**
 * Execute a chain of plugins in sequence
 * 
 * @param pluginIds Array of plugin IDs to execute in sequence
 * @param initialInput Initial input data
 * @param tenantId The tenant ID
 * @param options Additional options
 * @returns Results of all plugin executions
 */
export async function executePluginChain(
  pluginIds: string[],
  initialInput: Record<string, any>,
  tenantId: string,
  options: {
    strategyId?: string;
    continueOnError?: boolean;
    timeout?: number;
  } = {}
): Promise<RunPluginChainResult> {
  const results: PluginResult[] = [];
  let currentInput = { ...initialInput };
  let hasError = false;
  
  // Log the chain execution start
  try {
    await logSystemEvent(
      'plugin',
      'execute',
      {
        plugins: pluginIds,
        strategy_id: options.strategyId,
        chain_execution: true
      },
      tenantId
    );
  } catch (logError) {
    console.error('Failed to log plugin chain execution start:', logError);
  }
  
  // Execute each plugin in sequence
  for (const pluginId of pluginIds) {
    try {
      const result = await executePlugin(pluginId, currentInput, tenantId, {
        strategyId: options.strategyId,
        timeout: options.timeout
      });
      
      results.push(result);
      
      if (!result.success) {
        hasError = true;
        if (!options.continueOnError) {
          break;
        }
      } else {
        // Update the input for the next plugin with the output from this one
        currentInput = {
          ...currentInput,
          previousOutput: result.output
        };
      }
    } catch (error: any) {
      // Add a failed result and exit if continueOnError is false
      results.push({
        success: false,
        pluginId,
        status: 'error',
        error: error.message,
        xpEarned: 0 // Match the property name with the interface
      });
      
      hasError = true;
      if (!options.continueOnError) {
        break;
      }
    }
  }
  
  // Log the chain execution completion
  try {
    await logSystemEvent(
      'plugin',
      hasError ? 'execute_error' : 'execute_success',
      {
        plugins: pluginIds,
        strategy_id: options.strategyId,
        results_count: results.length,
        success_count: results.filter(r => r.success).length
      },
      tenantId
    );
  } catch (logError) {
    console.error('Failed to log plugin chain execution completion:', logError);
  }
  
  return {
    success: !hasError,
    results,
    error: hasError ? 'One or more plugins failed to execute' : undefined
  };
}

export default executePluginChain;
