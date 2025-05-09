
import { ExecuteStrategyInputSnakeCase, ExecuteStrategyResult } from '@/types/fixed';
import { runStrategy } from '@/lib/strategy/runStrategy';

// This is a wrapper around the runStrategy utility for the edge function
export default async function executeStrategy(
  input: ExecuteStrategyInputSnakeCase
): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  try {
    // Validate required inputs
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        strategy_id: '',
        status: 'error',
        execution_time: (performance.now() - startTime) / 1000
      };
    }

    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        strategy_id: input.strategy_id,
        status: 'error',
        execution_time: (performance.now() - startTime) / 1000
      };
    }

    // Convert snake_case input to camelCase for the utility function
    const result = await runStrategy({
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id,
      options: input.options
    });

    return {
      ...result,
      execution_time: (performance.now() - startTime) / 1000
    };
  } catch (err: any) {
    // Handle any unexpected errors
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
      strategy_id: input.strategy_id || '',
      status: 'error',
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}
