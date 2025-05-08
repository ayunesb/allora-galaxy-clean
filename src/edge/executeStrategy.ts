
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { formatErrorResponse, formatSuccessResponse } from '@/lib/edge/envManager';

/**
 * Execute strategy edge function
 */
export default async function executeStrategy(
  input: ExecuteStrategyInput
): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  try {
    // Validate input
    if (!input.strategyId) {
      return {
        success: false,
        error: 'Strategy ID is required',
        executionTime: (performance.now() - startTime) / 1000
      };
    }
    
    if (!input.tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required',
        executionTime: (performance.now() - startTime) / 1000
      };
    }
    
    // Execute strategy using shared utility
    const result = await runStrategy(input);
    
    return {
      ...result,
      executionTime: (performance.now() - startTime) / 1000
    };
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    return {
      success: false,
      error: error.message,
      executionTime: (performance.now() - startTime) / 1000
    };
  }
}
