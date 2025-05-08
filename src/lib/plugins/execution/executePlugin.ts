
import { supabase } from '@/integrations/supabase/client';
import { recordLogExecution } from '../logging/recordLogExecution';
import { getAgentVersion } from '@/lib/agents/agentManager';

interface ExecutePluginParams {
  pluginId: string;
  input: any;
  tenantId: string;
  strategyId?: string;
  userId?: string;
  agentVersionId?: string;
}

interface ExecutePluginResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  xpEarned: number;
}

/**
 * Execute a plugin with the given input
 * @param params Parameters for plugin execution
 * @returns Result of plugin execution
 */
export const executePlugin = async (params: ExecutePluginParams): Promise<ExecutePluginResult> => {
  const { pluginId, input, tenantId, strategyId, userId, agentVersionId } = params;
  const startTime = Date.now();
  
  try {
    // Fetch plugin details
    const { data: plugin, error: pluginError } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', pluginId)
      .single();
    
    if (pluginError) {
      throw new Error(`Failed to fetch plugin: ${pluginError.message}`);
    }
    
    if (!plugin) {
      throw new Error(`Plugin not found with ID: ${pluginId}`);
    }
    
    // If an agent version is specified, use it to execute the plugin
    let output: any;
    let agentVersion = null;
    
    if (agentVersionId) {
      agentVersion = await getAgentVersion(agentVersionId);
      if (!agentVersion) {
        throw new Error(`Agent version not found with ID: ${agentVersionId}`);
      }
      
      // TODO: Implement actual agent execution with prompt
      output = { result: `Simulated agent execution for ${plugin.name}`, success: true };
    } else {
      // Execute plugin directly
      // This is a simplified simulation - in a real implementation,
      // we would call an actual function based on the plugin type/ID
      output = { result: `Executed ${plugin.name} with input: ${JSON.stringify(input)}`, success: true };
    }
    
    const executionTime = (Date.now() - startTime) / 1000; // in seconds
    const xpEarned = Math.floor(executionTime * 10); // Simple XP calculation
    
    // Record execution log
    await recordLogExecution({
      pluginId,
      tenantId,
      status: 'success',
      input,
      output,
      executionTime,
      xpEarned,
      strategyId,
      agentVersionId
    });
    
    // Update plugin XP
    await supabase
      .from('plugins')
      .update({ xp: plugin.xp + xpEarned })
      .eq('id', pluginId);
    
    return {
      success: true,
      output,
      executionTime,
      xpEarned
    };
    
  } catch (err: unknown) {
    const executionTime = (Date.now() - startTime) / 1000;
    const error = err instanceof Error ? err.message : String(err);
    
    // Record execution log with error
    await recordLogExecution({
      pluginId,
      tenantId,
      status: 'failure',
      input,
      error,
      executionTime,
      xpEarned: 0,
      strategyId,
      agentVersionId
    });
    
    return {
      success: false,
      error,
      executionTime,
      xpEarned: 0
    };
  }
};
