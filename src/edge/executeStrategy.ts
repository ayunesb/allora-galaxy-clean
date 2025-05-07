
import { createClient } from '@supabase/supabase-js';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { 
  getEnvVar, 
  formatErrorResponse,
  formatSuccessResponse,
  handleEdgeRequest 
} from '@/lib/edge/envManager';

export default async function executeStrategy(input: { 
  userId?: string; 
  strategyId: string; 
  tenantId: string;
  options?: Record<string, unknown>;
}): Promise<ExecuteStrategyResult> {
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
    
    // Convert input to ExecuteStrategyInput
    const validatedInput: ExecuteStrategyInput = {
      strategyId: input.strategyId,
      tenantId: input.tenantId,
      userId: input.userId,
      options: input.options
    };
    
    // Execute the strategy using the runStrategy function
    const result = await runStrategy(validatedInput);
    
    // Add execution time to the result
    result.executionTime = (Date.now() - startTime) / 1000;
    
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
