
import { corsHeaders, getSafeEnv } from '../lib/utils';
import { runStrategy } from "../lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from '../types/strategy';

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
    
    // Return the result directly as it already matches ExecuteStrategyResult format
    return {
      success: result.success,
      error: result.error,
      execution_id: result.execution_id,
      execution_time: result.execution_time,
      outputs: result.outputs,
      results: result.results,
      logs: result.logs
    };
    
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Return standardized error response
    return {
      success: false,
      error: error.message || "Unexpected error executing strategy",
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}
