
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { camelToSnakeObject } from '@/lib/utils/dataConversion';

// Export the execute function
export async function execute(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Convert camelCase input to snake_case for the edge function
    const snakeInput = camelToSnakeObject(input);
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeInput
    });
    
    if (error) {
      throw new Error(`Error executing strategy: ${error.message}`);
    }
    
    // Convert snake_case response to camelCase as needed
    return {
      success: data.success,
      executionId: data.execution_id,
      executionTime: data.execution_time,
      status: data.status,
      results: data.results,
      outputs: data.outputs,
      error: data.error,
      logs: data.logs
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      status: 'error',
      executionTime: 0
    };
  }
}
