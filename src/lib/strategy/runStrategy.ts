
import { supabase } from "@/integrations/supabase/client";
import logSystemEvent from "@/lib/system/logSystemEvent";
import { fetchPlugins } from "./utils/fetchPlugins";
import { executePlugins } from "./utils/executePlugins";
import { validateInput } from "./utils/validateInput";
import { verifyStrategy } from "./utils/verifyStrategy";
import { updateStrategyProgress } from "./utils/updateStrategyProgress";

/**
 * Run a strategy by ID
 */
export async function runStrategy(strategyId: string, userId: string | undefined, tenantId: string) {
  try {
    // Log start of strategy execution
    logSystemEvent(
      "strategy",
      "info",
      `Starting strategy execution for ${strategyId}`
    );
    
    // Get strategy data
    const { strategy, error: strategyError } = await verifyStrategy(strategyId, tenantId);
    
    // Check for errors in strategy retrieval
    if (strategyError || !strategy) {
      logSystemEvent(
        "strategy",
        "error",
        `Error retrieving strategy: ${strategyError?.message || "Strategy not found"}`
      );
      return { error: strategyError || new Error("Strategy not found") };
    }
    
    // Validate the strategy input
    const { error: validationError } = validateInput(strategy);
    if (validationError) {
      logSystemEvent(
        "strategy",
        "error",
        `Strategy validation failed: ${validationError.message}`
      );
      return { error: validationError };
    }
    
    // Update strategy status to running
    await updateStrategyProgress(strategyId, 'running', 10);
    
    // Fetch plugins for this strategy
    const { plugins, error: pluginError } = await fetchPlugins(strategyId);
    
    if (pluginError || !plugins || plugins.length === 0) {
      logSystemEvent(
        "strategy",
        "error",
        `Error retrieving plugins: ${pluginError?.message || "No plugins found"}`
      );
      return { error: pluginError || new Error("No plugins found for strategy") };
    }
    
    // Update progress
    await updateStrategyProgress(strategyId, 'running', 20);
    
    // Execute plugins
    const { results, error: executionError } = await executePlugins(plugins, strategy, userId, tenantId);
    
    if (executionError) {
      logSystemEvent(
        "strategy",
        "error",
        `Error executing plugins: ${executionError.message}`
      );
      return { error: executionError };
    }
    
    // Update strategy status to completed
    await updateStrategyProgress(strategyId, 'completed', 100);
    
    logSystemEvent(
      "strategy",
      "info",
      `Strategy ${strategyId} executed successfully`
    );
    
    return { results };
    
  } catch (error: any) {
    // Log any unexpected errors
    logSystemEvent(
      "strategy",
      "error",
      `Unexpected error in runStrategy: ${error.message}`
    );
    return { error };
  }
}
