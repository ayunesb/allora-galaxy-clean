
import { ExecuteStrategyInput, ExecuteStrategyResult } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Execute a strategy
 * @param input Strategy execution input
 * @returns Strategy execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    if (!input.strategy_id) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input.tenant_id) {
      return { success: false, error: 'Tenant ID is required' };
    }

    // Call the executeStrategy edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: input
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
