
import { supabase } from "@/integrations/supabase/client";
import { recordExecution } from "@/lib/executions/recordExecution";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { Json } from "@/integrations/supabase/types";

interface PluginResult {
  plugin_id: string;
  name: string;
  status: 'success' | 'failure' | 'skipped';
  execution_time: number;
  error?: string;
  output?: Record<string, any>;
  xp_earned: number;
}

interface RunPluginChainResult {
  strategy_id: string;
  success: boolean;
  results: PluginResult[];
  total_execution_time: number;
  total_plugins_run: number;
  successful_plugins: number;
  failed_plugins: number;
}

/**
 * Runs all plugins associated with a strategy in order based on priority
 * @param strategyId The ID of the strategy to run plugins for
 * @param tenant_id The tenant ID for proper isolation
 * @param user_id The user ID executing this chain (for logging)
 * @returns A result object with success/failure status and details per plugin
 */
export async function runPluginChain(
  strategyId: string,
  tenant_id: string,
  user_id?: string
): Promise<RunPluginChainResult> {
  const startTime = performance.now();
  const results: PluginResult[] = [];
  let totalSuccessful = 0;
  let totalFailed = 0;
  
  try {
    // First, fetch the strategy to ensure it exists
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("id, title, tenant_id")
      .eq("id", strategyId)
      .single();
    
    if (strategyError || !strategy) {
      throw new Error(`Strategy not found: ${strategyError?.message || "Unknown error"}`);
    }
    
    // Ensure tenant_id matches strategy's tenant_id for security
    if (strategy.tenant_id !== tenant_id) {
      throw new Error("Strategy does not belong to the specified tenant");
    }
    
    // Log the start of the plugin chain execution
    await logSystemEvent({
      tenant_id,
      module: 'plugins',
      event: 'plugin_chain_started',
      context: { strategy_id: strategyId },
      user_id
    });
    
    // Get all plugins associated with this strategy
    const { data: plugins, error: pluginsError } = await supabase
      .from("plugins")
      .select(`
        id,
        name,
        description,
        status,
        metadata,
        xp,
        roi
      `)
      .eq("strategy_id", strategyId)
      .order("created_at", { ascending: true });
    
    if (pluginsError) {
      throw new Error(`Error fetching plugins: ${pluginsError.message}`);
    }
    
    if (!plugins || plugins.length === 0) {
      // No plugins found for this strategy
      return {
        strategy_id: strategyId,
        success: true,
        results: [],
        total_execution_time: 0,
        total_plugins_run: 0,
        successful_plugins: 0,
        failed_plugins: 0
      };
    }
    
    // Sort plugins by order if available in metadata
    const sortedPlugins = [...plugins].sort((a, b) => {
      const orderA = a.metadata?.order || 0;
      const orderB = b.metadata?.order || 0;
      return orderA - orderB;
    });
    
    // Execute each plugin in order
    for (const plugin of sortedPlugins) {
      if (plugin.status !== 'active') {
        // Skip inactive plugins but log them
        results.push({
          plugin_id: plugin.id,
          name: plugin.name,
          status: 'skipped',
          execution_time: 0,
          xp_earned: 0
        });
        continue;
      }
      
      const pluginStartTime = performance.now();
      let pluginStatus: 'success' | 'failure' = 'success';
      let pluginError: string | undefined;
      let pluginOutput: Record<string, any> | undefined;
      let xpEarned = 0;
      
      try {
        // Simulate plugin execution (in a real system, this would call the actual plugin logic)
        // In a real implementation, you'd fetch the latest agent version and execute it
        
        // For demo purposes, we'll just log the execution and simulate success
        pluginOutput = { executed: true, timestamp: new Date().toISOString() };
        
        // Calculate XP earned based on execution time and success
        // In a real system, this would be more sophisticated
        xpEarned = Math.floor(Math.random() * 10) + 1; // 1-10 XP for now
        
        totalSuccessful++;
      } catch (error: any) {
        pluginStatus = 'failure';
        pluginError = error.message || 'Unknown plugin error';
        totalFailed++;
      }
      
      const pluginEndTime = performance.now();
      const executionTime = pluginEndTime - pluginStartTime;
      
      // Record the plugin execution in plugin_logs
      await supabase
        .from("plugin_logs")
        .insert({
          plugin_id: plugin.id,
          strategy_id: strategyId,
          tenant_id,
          status: pluginStatus,
          input: { strategy_id: strategyId } as Json,
          output: pluginOutput as Json,
          error: pluginError,
          execution_time: executionTime,
          xp_earned: xpEarned
        });
      
      // Add to results
      results.push({
        plugin_id: plugin.id,
        name: plugin.name,
        status: pluginStatus,
        execution_time: executionTime,
        error: pluginError,
        output: pluginOutput,
        xp_earned
      });
      
      // Update the plugin's total XP
      if (pluginStatus === 'success') {
        await supabase
          .from("plugins")
          .update({ xp: plugin.xp + xpEarned })
          .eq("id", plugin.id);
      }
    }
    
    // Record the overall execution
    await recordExecution({
      tenant_id,
      type: 'strategy',
      status: totalFailed === 0 ? 'success' : (totalSuccessful > 0 ? 'partial' : 'failure'),
      strategy_id: strategyId,
      executed_by: user_id,
      execution_time: performance.now() - startTime,
      xp_earned: results.reduce((sum, r) => sum + r.xp_earned, 0)
    });
    
    const endTime = performance.now();
    
    return {
      strategy_id: strategyId,
      success: totalFailed === 0,
      results,
      total_execution_time: endTime - startTime,
      total_plugins_run: results.length,
      successful_plugins: totalSuccessful,
      failed_plugins: totalFailed
    };
    
  } catch (error: any) {
    console.error("Error running plugin chain:", error);
    
    // Log the error
    await logSystemEvent({
      tenant_id,
      module: 'plugins',
      event: 'plugin_chain_error',
      context: { strategy_id: strategyId, error: error.message },
      user_id
    });
    
    const endTime = performance.now();
    
    return {
      strategy_id: strategyId,
      success: false,
      results,
      total_execution_time: endTime - startTime,
      total_plugins_run: results.length,
      successful_plugins: totalSuccessful,
      failed_plugins: totalFailed
    };
  }
}
