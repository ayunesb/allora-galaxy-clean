
import { supabase } from '@/integrations/supabase/client';
import { recordExecution } from './recordExecution';
import { LogStatus, ExecutionRecordInput } from '@/types/fixed';
import { PluginResult } from '@/types/fixed';

interface PluginChainOptions {
  tenantId: string;
  strategyId: string;
  plugins: Array<{
    id: string;
    name: string;
    agentVersionId?: string;
    input?: any;
  }>;
  context?: Record<string, any>;
  maxFailures?: number;
}

export async function executePluginChain(options: PluginChainOptions): Promise<{
  success: boolean;
  results: PluginResult[];
  failedPlugins: number;
  executionTime: number;
  totalXp: number;
}> {
  const { tenantId, strategyId, plugins, context = {}, maxFailures = 3 } = options;
  
  const results: PluginResult[] = [];
  let failureCount = 0;
  let totalExecutionTime = 0;
  let totalXp = 0;
  
  // Execute each plugin in sequence
  for (const plugin of plugins) {
    const startTime = Date.now();
    let executionTime = 0;
    let xpEarned = 0;
    let status: LogStatus = 'pending';
    let error = null;
    
    try {
      console.log(`Executing plugin: ${plugin.name} (${plugin.id})`);
      
      // Check if we should stop the chain due to too many failures
      if (failureCount >= maxFailures) {
        throw new Error(`Chain execution stopped: Maximum failures (${maxFailures}) reached`);
      }
      
      // Prepare input data for the plugin
      const inputData = {
        ...plugin.input,
        context,
        results: results.map(r => r.output) // Allow access to previous results
      };
      
      // Record the execution start
      await recordExecution({
        tenantId,
        strategyId,
        pluginId: plugin.id,
        agentVersionId: plugin.agentVersionId,
        status: 'running' as LogStatus,
        type: 'plugin',
        input: inputData
      });
      
      // Execute the plugin (simplified for demo)
      // In a real implementation, this would call the plugin's execution code
      const pluginResult = { success: true, result: `Executed ${plugin.name}` };
      
      executionTime = Date.now() - startTime;
      xpEarned = Math.floor(executionTime / 100) + 10; // Simple XP calculation
      
      // Add successful result
      results.push({
        pluginId: plugin.id,
        status: 'success',
        output: pluginResult,
        executionTime,
        xpEarned
      });
      
      status = 'success' as LogStatus;
      totalExecutionTime += executionTime;
      totalXp += xpEarned;
      
      // Record the execution result
      await recordExecution({
        executionTime,
        xpEarned,
        output: pluginResult,
        tenantId,
        strategyId,
        pluginId: plugin.id,
        agentVersionId: plugin.agentVersionId,
        status,
        type: 'plugin',
        input: inputData
      });
    } catch (err: any) {
      failureCount++;
      executionTime = Date.now() - startTime;
      status = 'error' as LogStatus;
      error = err.message || 'Unknown plugin execution error';
      
      // Add failed result
      results.push({
        pluginId: plugin.id,
        status: 'failure',
        error,
        executionTime,
        xpEarned: 0
      });
      
      // Record the failed execution
      await recordExecution({
        executionTime,
        xpEarned: 0,
        error,
        tenantId,
        strategyId,
        pluginId: plugin.id,
        agentVersionId: plugin.agentVersionId,
        status,
        type: 'plugin',
        input: plugin.input
      });
      
      console.error(`Plugin execution failed: ${plugin.name}`, err);
    }
  }
  
  return {
    success: failureCount === 0,
    results,
    failedPlugins: failureCount,
    executionTime: totalExecutionTime,
    totalXp
  };
}
