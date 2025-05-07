
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { Json } from "@/integrations/supabase/types";
import { PluginResult, ExecutionStatus, Plugin } from "@/types/fixed";
import { camelToSnake } from "@/types/fixed";

/**
 * Records a plugin execution in the database
 */
export async function recordPluginExecution(
  pluginId: string,
  strategyId: string, 
  tenantId: string,
  pluginStatus: ExecutionStatus,
  executionTime: number,
  pluginOutput?: Record<string, any>,
  pluginError?: string,
  xpEarned: number = 0
): Promise<void> {
  await supabase
    .from("plugin_logs")
    .insert({
      plugin_id: pluginId,
      strategy_id: strategyId,
      tenant_id: tenantId,
      status: pluginStatus,
      input: { strategy_id: strategyId } as Json,
      output: pluginOutput as Json,
      error: pluginError,
      execution_time: executionTime,
      xp_earned: xpEarned
    });
}

/**
 * Updates a plugin's XP after successful execution
 */
export async function updatePluginXP(
  pluginId: string,
  currentXP: number,
  earnedXP: number
): Promise<void> {
  await supabase
    .from("plugins")
    .update({ xp: currentXP + earnedXP })
    .eq("id", pluginId);
}

/**
 * Validates that a strategy exists and belongs to the specified tenant
 */
export async function validateStrategy(
  strategyId: string, 
  tenantId: string
): Promise<{ valid: boolean; strategy?: any; error?: string }> {
  const { data: strategy, error: strategyError } = await supabase
    .from("strategies")
    .select("id, title, tenant_id")
    .eq("id", strategyId)
    .single();
  
  if (strategyError || !strategy) {
    return { 
      valid: false, 
      error: `Strategy not found: ${strategyError?.message || "Unknown error"}` 
    };
  }
  
  if (strategy.tenant_id !== tenantId) {
    return { 
      valid: false, 
      error: "Strategy does not belong to the specified tenant" 
    };
  }
  
  return { valid: true, strategy };
}

/**
 * Fetches all plugins for a strategy
 */
export async function fetchPluginsForStrategy(strategyId: string): Promise<{ plugins?: Plugin[]; error?: string }> {
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
    return { error: `Error fetching plugins: ${pluginsError.message}` };
  }
  
  return { plugins };
}

/**
 * Execute a single plugin and return the result
 */
export async function executePlugin(
  plugin: any,
  strategyId: string,
  tenantId: string
): Promise<PluginResult> {
  const pluginStartTime = performance.now();
  let pluginStatus: ExecutionStatus = 'success';
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
  } catch (error: any) {
    pluginStatus = 'failure';
    pluginError = error.message || 'Unknown plugin error';
  }
  
  const pluginEndTime = performance.now();
  const executionTime = pluginEndTime - pluginStartTime;
  
  // Record the plugin execution
  await recordPluginExecution(
    plugin.id,
    strategyId,
    tenantId,
    pluginStatus,
    executionTime,
    pluginOutput,
    pluginError,
    xpEarned
  );
  
  // Update plugin XP if successful
  if (pluginStatus === 'success') {
    await updatePluginXP(plugin.id, plugin.xp, xpEarned);
  }
  
  return {
    pluginId: plugin.id,
    name: plugin.name,
    status: pluginStatus,
    executionTime: executionTime,
    error: pluginError,
    output: pluginOutput,
    xpEarned: xpEarned
  };
}
