
import { corsHeaders } from '../lib/edge/corsHeaders';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '../types/strategy';
import { logSystemEvent } from '../lib/system/logSystemEvent';
import { supabase } from '../integrations/supabase/client';
import { handleEdgeFunctionError } from '../lib/edge/errorHandler';
import { getEnv } from '../lib/edge/envManager';

// Mock for Deno in browser environment
const Deno = globalThis.Deno || { env: { get: () => undefined } };

/**
 * Edge function to execute a strategy
 * This function calls the runStrategy utility to perform the actual strategy execution,
 * handles validation, logging, and error handling.
 */
export default async function executeStrategy(req: Request) {
  const start = Date.now();
  
  try {
    // Parse input from request
    let input: ExecuteStrategyInput;
    
    // Handle both Request objects and direct input objects for flexibility in testing
    if (req instanceof Request) {
      // For HTTP requests
      input = await req.json();
    } else {
      // For direct function calls (testing)
      input = req as unknown as ExecuteStrategyInput;
    }

    // Validate required fields
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: (Date.now() - start) / 1000
      };
    }

    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: (Date.now() - start) / 1000
      };
    }

    // Normalize input format (snake_case to camelCase for backwards compatibility)
    const normalizedInput = {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id,
      options: input.options || {}
    };

    // Log execution start
    await logSystemEvent(
      input.tenant_id, 
      'strategy',
      'execute_strategy_started',
      { 
        strategy_id: input.strategy_id,
        user_id: input.user_id
      }
    );

    // Execute the strategy using the shared utility function
    const { success, error, execution_id, execution_time, results, logs } = await runStrategy(normalizedInput);

    // Create result object
    const result = {
      success,
      error,
      execution_id,
      execution_time: execution_time || (Date.now() - start) / 1000,
      results,
      logs
    } as ExecuteStrategyResult;

    // Log execution result
    await logSystemEvent(
      input.tenant_id,
      'strategy',
      success ? 'execute_strategy_completed' : 'execute_strategy_failed',
      { 
        strategy_id: input.strategy_id,
        execution_id: execution_id,
        error: error,
        execution_time: result.execution_time
      }
    );

    // Return result
    if (req instanceof Request) {
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return result;

  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    
    // Log error
    if (req instanceof Request) {
      const inputObj = await req.clone().json().catch(() => ({}));
      const tenantId = (inputObj as any)?.tenant_id || 'system';
      
      await logSystemEvent(
        tenantId,
        'strategy',
        'execute_strategy_error',
        { error }
      ).catch(console.error);
      
      return handleEdgeFunctionError(error);
    }
    
    // For testing/direct calls
    return {
      success: false,
      error,
      execution_time: (Date.now() - start) / 1000
    };
  }
}

// Handle preflight CORS requests
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    return await executeStrategy(req);
  } catch (err) {
    return handleEdgeFunctionError(err);
  }
});
