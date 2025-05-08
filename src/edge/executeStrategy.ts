
import { runStrategy } from '@/lib/strategy/runStrategy';
import { ExecuteStrategyInput, ExecuteStrategyInputSnakeCase } from '@/types/fixed';

interface ResponseData {
  success: boolean;
  execution_id?: string;
  execution_time?: number;
  error?: string;
  data?: any;
}

export default async function executeStrategy(input: ExecuteStrategyInput | ExecuteStrategyInputSnakeCase): Promise<ResponseData> {
  try {
    // Start measuring time
    const startTime = performance.now();

    // Normalize input to camelCase for consistent handling
    const normalizedInput: ExecuteStrategyInput = {
      strategyId: (input as ExecuteStrategyInputSnakeCase).strategy_id || (input as ExecuteStrategyInput).strategyId,
      tenantId: (input as ExecuteStrategyInputSnakeCase).tenant_id || (input as ExecuteStrategyInput).tenantId,
      userId: (input as ExecuteStrategyInputSnakeCase).user_id || (input as ExecuteStrategyInput).userId,
      options: input.options
    };

    // Validate required parameters
    if (!normalizedInput?.strategyId) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: getMeasuredTime(startTime)
      };
    }

    if (!normalizedInput?.tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: getMeasuredTime(startTime)
      };
    }

    // Execute the strategy
    const result = await runStrategy(normalizedInput);

    // Return appropriate response
    return {
      success: result.success,
      error: result.error,
      execution_id: result.execution_id,
      execution_time: result.execution_time,
      data: result.data
    };
  } catch (error: any) {
    // Handle unexpected errors
    return {
      success: false,
      error: error.message || 'Unexpected error',
      execution_time: 0
    };
  }
}

// Helper for measuring execution time
function getMeasuredTime(startTime: number): number {
  const endTime = performance.now();
  return parseFloat(((endTime - startTime) / 1000).toFixed(3));
}
