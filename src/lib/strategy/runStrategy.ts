
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { supabase } from '@/integrations/supabase/client';
import { camelToSnake } from '@/types/fixed';

/**
 * Execute a strategy
 * @param input Strategy execution input
 * @returns Strategy execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    if (!input.strategyId) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input.tenantId) {
      return { success: false, error: 'Tenant ID is required' };
    }

    // Convert input to snake_case for the edge function
    const snakeCaseInput = camelToSnake(input);

    // Call the executeStrategy edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeCaseInput
    });

    if (error) {
      throw new Error(`Error executing strategy: ${error.message}`);
    }

    return data as ExecuteStrategyResult;
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
}
