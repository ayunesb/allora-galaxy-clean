
import { supabase } from '@/integrations/supabase/client';
import { LogStatus } from '@/types/shared';
import { recordExecution } from '@/lib/plugins/execution/recordExecution';

interface ExecutePluginChainOptions {
  tenantId: string;
  strategyId: string;
  pluginIds: string[];
  inputs?: Record<string, any>;
}

interface ExecutePluginChainResult {
  success: boolean;
  executedPlugins: number;
  successfulPlugins: number;
  totalXpEarned: number;
  errors?: string[];
  outputs?: Record<string, any>[];
}

export async function executePluginChain(
  options: ExecutePluginChainOptions
): Promise<ExecutePluginChainResult> {
  const { tenantId, strategyId, pluginIds, inputs = {} } = options;
  const outputs: Record<string, any>[] = [];
  const errors: string[] = [];
  let totalXpEarned = 0;
  
  // Execute each plugin in sequence
  for (const pluginId of pluginIds) {
    try {
      // Fetch the plugin and its agent version
      const { data: plugin, error: pluginError } = await supabase
        .from('plugins')
        .select('*, agent_versions(*)')
        .eq('id', pluginId)
        .single();
        
      if (pluginError || !plugin) {
        errors.push(`Plugin ${pluginId} not found`);
        continue;
      }
      
      const agentVersionId = plugin.agent_versions?.[0]?.id;
      
      if (!agentVersionId) {
        errors.push(`No agent version found for plugin ${plugin.name}`);
        continue;
      }
      
      // Record execution start
      const executionData = {
        tenantId,
        strategyId,
        pluginId,
        agentVersionId,
        status: 'running' as LogStatus,
        type: 'plugin',
        input: inputs[pluginId] || { strategy_id: strategyId }
      };
      
      const execution = await recordExecution(executionData);
      
      // Execute plugin logic here (simulated)
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated execution
      const executionTime = (Date.now() - startTime) / 1000;
      const xpEarned = Math.floor(Math.random() * 20) + 5;
      totalXpEarned += xpEarned;
      
      // Record execution completion
      await recordExecution({
        ...executionData,
        executionTime,
        xpEarned,
        output: { success: true, result: `Plugin ${plugin.name} executed successfully` }
      });
      
      outputs.push({ 
        pluginId, 
        name: plugin.name,
        success: true,
        xpEarned,
        executionTime
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing plugin ${pluginId}:`, error);
      errors.push(errorMessage || `Error executing plugin ${pluginId}`);
      
      // Record execution failure
      await recordExecution({
        tenantId,
        strategyId,
        pluginId,
        type: 'plugin',
        status: 'error' as LogStatus,
        error: errorMessage
      }).catch((e: unknown) => console.error('Failed to record execution error:', e));
    }
  }

  return {
    success: errors.length === 0,
    executedPlugins: pluginIds.length,
    successfulPlugins: outputs.length,
    totalXpEarned,
    errors: errors.length > 0 ? errors : undefined,
    outputs: outputs.length > 0 ? outputs : undefined
  };
}
