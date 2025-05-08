
import { createClient } from '@supabase/supabase-js';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { 
  getEnvVar, 
  formatErrorResponse,
  formatSuccessResponse
} from '@/lib/edge/envManager';

/**
 * Execute a strategy via edge function
 * This function serves as the entry point for strategy execution
 */
export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  
  try {
    // Input validation
    if (!input.strategyId) {
      return {
        success: false,
        error: 'Strategy ID is required',
        executionTime: (Date.now() - startTime) / 1000
      };
    }

    if (!input.tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required',
        executionTime: (Date.now() - startTime) / 1000
      };
    }
    
    // Execute the strategy using the shared runStrategy utility
    const result = await runStrategy(input);
    
    // Add execution time to the result if not already present
    if (!result.executionTime) {
      result.executionTime = (Date.now() - startTime) / 1000;
    }
    
    return result;
  } catch (error: any) {
    // Handle unexpected errors gracefully
    console.error('Error executing strategy:', error);
    
    return {
      success: false,
      error: error.message || 'Unexpected error',
      executionTime: (Date.now() - startTime) / 1000
    };
  }
}
