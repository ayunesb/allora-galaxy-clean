
import { supabase } from '@/integrations/supabase/client';
import { executePlugin } from './executePlugin';
import { recordLogExecution } from '../logging/recordLogExecution';
import { PluginResult } from '@/types/plugin';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface ExecutePluginChainParams {
  pluginIds: string[];
  input?: Record<string, any>;
  tenantId: string;
  userId?: string;
  strategyId?: string;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  output?: Record<string, any>;
  error?: string;
}

/**
 * Execute a chain of plugins in sequence
 * @param params Parameters for the plugin chain execution
 */
export async function executePluginChain(params: ExecutePluginChainParams): Promise<RunPluginChainResult> {
  const { pluginIds, input = {}, tenantId, userId, strategyId } = params;
  
  if (!pluginIds.length) {
    return {
      success: false,
      error: 'No plugins provided',
      results: []
    };
  }
  
  try {
    // Fetch all plugins with their latest agent versions
    const { data: plugins, error } = await supabase
      .from('plugins')
      .select(`
        id,
        name,
        description,
        metadata,
        agent_versions!inner (
          id,
          version,
          prompt,
          status
        )
      `)
      .in('id', pluginIds)
      .eq('agent_versions.status', 'active');
    
    if (error) {
      throw new Error(`Failed to fetch plugins: ${error.message}`);
    }
    
    if (!plugins || plugins.length === 0) {
      return {
        success: false,
        error: 'No plugins found with the given IDs',
        results: []
      };
    }
    
    // Sort plugins to match the order of pluginIds
    const sortedPlugins = pluginIds.map(id => 
      plugins.find(plugin => plugin.id === id)
    ).filter(Boolean);
    
    // Execute plugins in sequence, passing output of previous as input to next
    let currentInput = { ...input };
    const results: PluginResult[] = [];
    
    for (const plugin of sortedPlugins) {
      if (!plugin) continue;
      
      const agentVersion = plugin.agent_versions[0];
      if (!agentVersion) {
        const result: PluginResult = {
          plugin_id: plugin.id,
          success: false,
          status: 'failure',
          output: {},
          error: 'No active agent version found for plugin',
          execution_time: 0,
          xp_earned: 0
        };
        results.push(result);
        continue;
      }
      
      try {
        // Execute the plugin
        const startTime = Date.now();
        
        const executionResult = await executePlugin({
          pluginId: plugin.id,
          tenantId,
          userId: userId || '',
          input: currentInput,
          strategyId,
          agentVersionId: agentVersion.id
        });
        
        const execution_time = Date.now() - startTime;
        const xp_earned = Math.round(execution_time / 100); // Simple XP calculation
        
        // Record execution log
        await recordLogExecution({
          pluginId: plugin.id,
          tenantId,
          status: executionResult.success ? 'success' : 'failure',
          input: currentInput,
          output: executionResult.output,
          error: executionResult.error,
          executionTime: execution_time,
          xpEarned: xp_earned,
          strategyId,
          agentVersionId: agentVersion.id
        });
        
        // Add result to results array
        const result: PluginResult = {
          plugin_id: plugin.id,
          success: executionResult.success,
          status: executionResult.success ? 'success' : 'failure',
          output: executionResult.output,
          error: executionResult.error,
          execution_time,
          xp_earned,
        };
        
        results.push(result);
        
        // Update current input for next plugin in chain
        if (executionResult.success && executionResult.output) {
          currentInput = {
            ...currentInput,
            ...(typeof executionResult.output === 'object' ? executionResult.output : { result: executionResult.output })
          };
        } else if (executionResult.error) {
          // Log error but continue execution
          console.error(`Plugin ${plugin.name} execution failed:`, executionResult.error);
        }
      } catch (err: any) {
        // Handle unexpected errors
        const errorMessage = err.message || 'Unknown error occurred';
        console.error(`Unexpected error executing plugin ${plugin.name}:`, err);
        
        const result: PluginResult = {
          plugin_id: plugin.id,
          success: false,
          status: 'failure',
          output: {},
          error: errorMessage,
          execution_time: 0,
          xp_earned: 0,
        };
        
        results.push(result);
      }
    }
    
    // Log chain execution to system logs
    await logSystemEvent(
      'plugin',
      'info',
      {
        description: `Plugin chain executed with ${results.length} plugins (${results.filter(r => r.success).length} succeeded, ${results.filter(r => !r.success).length} failed)`,
        event: 'plugin_chain_executed',
        plugin_count: results.length,
        strategy_id: strategyId,
        success_count: results.filter(r => r.success).length,
        failure_count: results.filter(r => !r.success).length,
        user_id: userId
      },
      tenantId
    );
    
    return {
      success: results.some(r => r.success), // Chain is successful if at least one plugin succeeded
      results,
      output: currentInput
    };
  } catch (err: any) {
    console.error('Error executing plugin chain:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
      results: []
    };
  }
}
