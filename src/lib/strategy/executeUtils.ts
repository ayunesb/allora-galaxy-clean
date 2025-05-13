
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { 
  ExecuteStrategyInput, 
  ExecuteStrategyInputSnakeCase,
  ExecuteStrategyResult 
} from '@/types/fixed/execution';
import { camelToSnakeObject } from '@/lib/utils/dataConversion';

/**
 * Edge function response format
 */
interface StrategyExecutionResponse {
  success: boolean;
  execution_id?: string;
  strategy_id?: string;
  plugins_executed?: number;
  successful_plugins?: number;
  execution_time_ms?: number;
  xp_earned?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
  error?: string;
  status?: string;
}

/**
 * Executes a strategy via edge function
 * @param input Strategy execution parameters
 * @returns Promise with ExecuteStrategyResult
 */
export async function executeStrategyEdge(
  input: ExecuteStrategyInput
): Promise<ExecuteStrategyResult> {
  try {
    // Convert input to snake_case for API compatibility
    const payload: ExecuteStrategyInputSnakeCase = {
      strategy_id: input.strategyId,
      tenant_id: input.tenantId,
      user_id: input.userId,
      options: input.options
    };
    
    // Log execution start
    await logSystemEvent(
      'strategy',
      'execution_start',
      {
        strategy_id: payload.strategy_id,
        tenant_id: payload.tenant_id,
        user_id: payload.user_id
      },
      payload.tenant_id
    );
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: payload
    });
    
    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    // Process the response
    const result = processExecutionResponse(data);
    
    // Log execution completion
    await logSystemEvent(
      'strategy',
      'execution_complete',
      {
        strategy_id: payload.strategy_id,
        execution_id: result.executionId,
        status: result.status
      },
      payload.tenant_id
    );
    
    return result;
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    
    // Log the error
    await logSystemEvent(
      'strategy',
      'execution_error',
      { error: error.message }
    );
    
    return {
      success: false,
      executionTime: 0,
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Process the execution response from the edge function
 */
export function processExecutionResponse(
  response: StrategyExecutionResponse
): ExecuteStrategyResult {
  if (!response) {
    return {
      success: false,
      status: 'error',
      executionTime: 0,
      error: 'No response received'
    };
  }
  
  return {
    success: response.success,
    executionId: response.execution_id,
    executionTime: response.execution_time_ms 
      ? response.execution_time_ms / 1000
      : 0,
    status: response.status || 'unknown',
    error: response.error,
    pluginsExecuted: response.plugins_executed,
    successfulPlugins: response.successful_plugins,
    xpEarned: response.xp_earned,
    outputs: response.outputs,
    results: response.results,
    logs: response.logs
  };
}

/**
 * Convert snake_case response to camelCase
 */
export function formatExecutionResponse(
  response: Record<string, any>
): Record<string, any> {
  const formatted: Record<string, any> = {};
  
  Object.keys(response).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    formatted[camelKey] = response[key];
  });
  
  return formatted;
}
