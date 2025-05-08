
import { runStrategy } from '@/lib/strategy/runStrategy';
import { ExecuteStrategyInput } from '@/types/fixed';

interface ResponseData {
  success: boolean;
  execution_id?: string;
  execution_time?: number;
  error?: string;
  data?: any;
}

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ResponseData> {
  try {
    // Start measuring time
    const startTime = performance.now();

    // Validate required parameters
    if (!input?.strategyId) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: getMeasuredTime(startTime)
      };
    }

    if (!input?.tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: getMeasuredTime(startTime)
      };
    }

    // Execute the strategy
    const result = await runStrategy(input);

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
