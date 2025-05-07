
import { createClient } from '@supabase/supabase-js';
import { 
  ExecuteStrategyInput, 
  ExecuteStrategyResult,
  camelToSnake
} from '@/types/fixed';
import { runStrategy } from '@/lib/strategy/runStrategy';

// Helper function to safely get environment variables
function getEnvVar(name: string, fallback: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof globalThis.Deno !== 'undefined') {
      return globalThis.Deno.env.get(name) || fallback;
    }
    // Fallback to process.env for Node environment
    return process.env[name] || fallback;
  } catch (error) {
    // If all else fails, return the fallback
    console.warn(`Error accessing env var ${name}:`, error);
    return fallback;
  }
}

export default async function executeStrategy(input: { 
  userId?: string; 
  strategyId: string; 
  tenantId: string;
  options?: Record<string, unknown>;
}): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  
  try {
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
