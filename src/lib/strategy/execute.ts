
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { camelToSnake } from '@/types/fixed';

// Export the execute function
export async function execute(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Convert camelCase input to snake_case for the edge function
    const snakeInput = camelToSnake(input);
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeInput
    });
    
    if (error) {
      throw new Error(`Error executing strategy: ${error.message}`);
    }
    
    // Return the data as is - no conversion needed as it's already in the expected format
    return data as ExecuteStrategyResult;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      status: 'error'
    };
  }
}
