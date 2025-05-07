
import { createClient } from '@supabase/supabase-js';
import { 
  ExecuteStrategyInput, 
  ExecuteStrategyResult,
  executeStrategySchema 
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

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  
  try {
    // Validate input against schema
    const validationResult = executeStrategySchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: `Invalid input: ${validationResult.error.message}`,
        executionTime: (Date.now() - startTime) / 1000
      };
    }

    const validatedInput = validationResult.data;
    
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
