
import { supabase } from '@/integrations/supabase/client';
import { recordExecution } from '@/lib/executions/recordExecution';
import { LogStatus } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Types for plugin management
export interface PluginInput {
  tenantId: string;
  userId?: string;
  strategyId?: string;
  agentVersionId?: string;
  parameters: Record<string, any>;
}

export interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

export interface ExecutionStatus {
  pluginId: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  result?: PluginResult;
}

export interface RunPluginChainResult {
  success: boolean;
  results: Record<string, PluginResult>;
  failedAt?: string;
  error?: string;
  executionId?: string;
  executionTime?: number;
}

/**
 * Execute a single plugin
 * @param pluginId - Plugin ID
 * @param input - Plugin input parameters
 * @returns Plugin execution result
 */
export async function executePlugin(
  pluginId: string,
  input: PluginInput
): Promise<PluginResult> {
  const startTime = Date.now();
  
  try {
    // Input validation
    if (!pluginId) {
      throw new Error('Plugin ID is required');
    }
    
    if (!input.tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    // Get plugin details
    const { data: plugin, error: pluginError } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', pluginId)
      .single();
      
    if (pluginError || !plugin) {
      throw new Error(`Plugin not found: ${pluginError?.message || ''}`);
    }
    
    // Check if plugin is active
    if (plugin.status !== 'active') {
      throw new Error(`Plugin is not active: ${plugin.status}`);
    }
    
    // Execute plugin via edge function
    const { data, error: functionError } = await supabase.functions.invoke(
      'executePlugin',
      {
        body: {
          plugin_id: pluginId,
          tenant_id: input.tenantId,
          user_id: input.userId,
          strategy_id: input.strategyId,
          agent_version_id: input.agentVersionId,
          parameters: input.parameters
        }
      }
    );
    
    if (functionError) {
      throw new Error(`Plugin execution failed: ${functionError.message}`);
    }
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Return result
    return {
      success: true,
      data: data.result,
      executionTime,
      xpEarned: data.xp_earned || 0
    };
  } catch (error: any) {
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Log the error
    console.error(`Plugin execution error (${pluginId}):`, error);
    
    // Return error result
    return {
      success: false,
      error: error.message || 'Unknown plugin execution error',
      executionTime,
      xpEarned: 0
    };
  }
}

/**
 * Record plugin execution in the database
 * @param pluginId - Plugin ID
 * @param input - Plugin input
 * @param result - Plugin execution result
 */
export async function recordPluginExecution(
  pluginId: string,
  input: PluginInput,
  result: PluginResult
) {
  try {
    const status: LogStatus = result.success ? 'success' : 'failure';
    
    const executionData = {
      tenantId: input.tenantId,
      pluginId,
      strategyId: input.strategyId,
      agentVersionId: input.agentVersionId,
      executedBy: input.userId,
      status,
      type: 'plugin',
      input: input.parameters,
      output: result.data,
      executionTime: result.executionTime || 0,
      xpEarned: result.xpEarned || 0,
      error: result.error
    };
    
    // Record in executions table
    const executionRecord = await recordExecution(executionData);
    
    // Also record in plugin_logs for detailed plugin analytics
    await supabase
      .from('plugin_logs')
      .insert({
        tenant_id: input.tenantId,
        plugin_id: pluginId,
        strategy_id: input.strategyId,
        agent_version_id: input.agentVersionId,
        status,
        input: input.parameters,
        output: result.data,
        execution_time: result.executionTime || 0,
        xp_earned: result.xpEarned || 0,
        error: result.error
      });
      
    return executionRecord;
  } catch (error) {
    console.error('Error recording plugin execution:', error);
    throw error;
  }
}

/**
 * Run a chain of plugins in sequence
 * @param pluginIds - Array of plugin IDs to execute in sequence
 * @param baseInput - Base input for all plugins
 * @param dependencies - Plugin dependencies configuration
 * @returns Chain execution result
 */
export async function runPluginChain(
  pluginIds: string[],
  baseInput: PluginInput,
  dependencies: Record<string, string[]> = {}
): Promise<RunPluginChainResult> {
  const startTime = Date.now();
  const results: Record<string, PluginResult> = {};
  let success = true;
  let failedAt: string | undefined;
  
  try {
    // Input validation
    if (!pluginIds.length) {
      throw new Error('At least one plugin ID is required');
    }
    
    if (!baseInput.tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    // Record the chain execution start
    const chainExecutionId = await recordChainStart(baseInput, pluginIds);
    
    // Execute plugins in sequence
    for (const pluginId of pluginIds) {
      // Check if plugin has dependencies
      const deps = dependencies[pluginId] || [];
      
      // Verify all dependencies have been executed successfully
      const missingDeps = deps.filter(dep => !results[dep] || !results[dep].success);
      
      if (missingDeps.length > 0) {
        // Mark as failure due to missing dependencies
        success = false;
        failedAt = pluginId;
        
        results[pluginId] = {
          success: false,
          error: `Missing required dependencies: ${missingDeps.join(', ')}`,
          executionTime: 0,
          xpEarned: 0
        };
        
        continue;
      }
      
      // Prepare input for this plugin, including outputs from dependencies
      const pluginInput: PluginInput = {
        ...baseInput,
        parameters: {
          ...baseInput.parameters,
          // Add dependency outputs
          dependencies: deps.reduce((acc, dep) => {
            acc[dep] = results[dep]?.data;
            return acc;
          }, {} as Record<string, any>)
        }
      };
      
      // Execute the plugin
      try {
        const result = await executePlugin(pluginId, pluginInput);
        results[pluginId] = result;
        
        // Record execution
        await recordPluginExecution(pluginId, pluginInput, result);
        
        // If plugin failed, mark chain as failed
        if (!result.success) {
          success = false;
          failedAt = pluginId;
          
          // We continue executing plugins that don't depend on the failed one
        }
      } catch (error: any) {
        // Handle plugin execution error
        results[pluginId] = {
          success: false,
          error: error.message || 'Unknown execution error',
          executionTime: 0,
          xpEarned: 0
        };
        
        success = false;
        failedAt = pluginId;
      }
    }
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Update the chain execution record with final status
    await updateChainExecution(
      chainExecutionId, 
      success ? 'success' : 'failure',
      executionTime
    );
    
    // Return the overall result
    return {
      success,
      results,
      failedAt,
      executionId: chainExecutionId,
      executionTime
    };
  } catch (error: any) {
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Log the error
    console.error('Plugin chain execution error:', error);
    
    // Return error result
    return {
      success: false,
      results,
      error: error.message || 'Unknown chain execution error',
      executionTime
    };
  }
}

/**
 * Record the start of a plugin chain execution
 */
async function recordChainStart(
  baseInput: PluginInput, 
  pluginIds: string[]
): Promise<string> {
  try {
    const record = await recordExecution({
      tenantId: baseInput.tenantId,
      type: 'plugin_chain',
      status: 'pending',
      executedBy: baseInput.userId,
      strategyId: baseInput.strategyId,
      input: { plugin_ids: pluginIds, base_parameters: baseInput.parameters }
    });
    
    return record.id;
  } catch (error) {
    console.error('Error recording chain start:', error);
    throw error;
  }
}

/**
 * Update the chain execution record with final status
 */
async function updateChainExecution(
  executionId: string,
  status: 'success' | 'failure',
  executionTime: number
): Promise<void> {
  try {
    await supabase
      .from('executions')
      .update({
        status,
        execution_time: executionTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId);
  } catch (error) {
    console.error('Error updating chain execution:', error);
  }
}
