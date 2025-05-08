
// Edge function for executing strategies
import { ExecuteStrategyInput, ExecuteStrategyResult, ValidationResult } from '@/types/strategy';

// Helper function to safely get environment variables with fallbacks
function getEnv(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available
    if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for non-Deno environments
    return process.env[name] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to validate input
function validateInput(input: any): ValidationResult {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("Strategy ID is required");
  }
  
  if (!input.tenant_id) {
    errors.push("Tenant ID is required");
  }
  
  return { valid: errors.length === 0, errors };
}

// Main handler function for the edge function
export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  const executionId = crypto.randomUUID();
  
  try {
    // Validate input first
    const validation = validateInput(input);
    if (!validation.valid && validation.errors) {
      return {
        success: false,
        error: validation.errors.join(", "),
        execution_id: executionId,
        execution_time: (performance.now() - startTime) / 1000
      };
    }

    // Ensure types are compatible with runStrategy
    const inputForRunStrategy = {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id,
      options: input.options
    };

    // Import dynamically to avoid issues with edge function context
    const { runStrategy } = await import('@/lib/strategy/runStrategy');
    
    // Execute strategy
    const result = await runStrategy(inputForRunStrategy);
    
    // Return result in the expected format
    return {
      ...result,
      strategy_id: input.strategy_id,
      execution_id: executionId,
      execution_time: (performance.now() - startTime) / 1000
    };
  } catch (error: any) {
    console.error("Error executing strategy:", error);
    
    // Return error information
    return {
      success: false,
      strategy_id: input.strategy_id,
      execution_id: executionId,
      error: error.message || "An unexpected error occurred",
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}

// For Deno environment
if (typeof Deno !== 'undefined') {
  Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Parse request body
      const input = await req.json() as ExecuteStrategyInput;
      
      // Execute strategy
      const result = await executeStrategy(input);
      
      // Return result
      return new Response(
        JSON.stringify(result),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to process request" 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
  });
}
