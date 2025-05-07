
import { createClient } from '@supabase/supabase-js';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/lib/strategy/types';
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

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  
  try {
    // Validate required inputs
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: (Date.now() - startTime) / 1000
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: (Date.now() - startTime) / 1000
      };
    }

    // Optional inputs and their defaults
    input.user_id = input.user_id || null; 
    input.options = input.options || {};
    
    // Execute the strategy using the runStrategy function
    const result = await runStrategy(input);
    
    // Add execution time to the result
    result.execution_time = (Date.now() - startTime) / 1000;
    
    return result;
  } catch (error: any) {
    // Handle unexpected errors gracefully
    console.error('Error executing strategy:', error);
    
    return {
      success: false,
      error: error.message || 'Unexpected error',
      execution_time: (Date.now() - startTime) / 1000
    };
  }
}
