
import { corsHeaders } from '../lib/utils';
import { supabase } from '../integrations/supabase/client';
import { runStrategy } from "../lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from '../types/strategy';

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    if (typeof Deno !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for non-Deno environments
    return process.env[name as keyof typeof process.env] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Handler for strategy execution
export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  try {
    // Validate required fields
    if (!input.strategy_id) {
      return {
        success: false,
        error: "Strategy ID is required",
        execution_time: (performance.now() - startTime) / 1000
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: "Tenant ID is required",
        execution_time: (performance.now() - startTime) / 1000
      };
    }
    
    // Convert snake_case to camelCase for compatibility with utility function
    const strategyInput = {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id,
      options: input.options
    };
    
    // Execute the strategy using the shared utility
    const result = await runStrategy(strategyInput);
    
    // Convert camelCase back to snake_case for the API response
    return {
      success: result.success,
      strategy_id: input.strategy_id,
      execution_id: result.executionId,
      error: result.error,
      execution_time: result.executionTime,
      data: result.data,
      plugins_executed: result.pluginsExecuted,
      successful_plugins: result.successfulPlugins,
      xp_earned: result.xpEarned,
      status: result.status
    };
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Return standardized error response
    return {
      success: false,
      strategy_id: input.strategy_id,
      error: error.message || "Unexpected error executing strategy",
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}
