
import { supabase } from '@/integrations/supabase/client';
import { StrategyInput, StrategyExecutionResult } from '@/lib/strategy/types';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a strategy with the given input parameters
 * using Edge Functions
 * 
 * @param input Strategy execution input parameters
 * @returns Promise with execution result
 */
export async function executeStrategy(input: StrategyInput): Promise<StrategyExecutionResult> {
  try {
    const { strategy_id, plugins = [], tenant_id, user_id, input_data } = input;
    
    // Prepare the execution payload
    const payload = {
      strategy_id,
      plugins: plugins.map(p => typeof p === 'string' ? p : p.id),
      tenant_id,
      user_id,
      input: input_data || {},
      options: {
        simulate: false,
        timeout: 30000
      }
    };
    
    // Log the execution start
    await logSystemEvent(
      'strategy',
      'execution_start',
      {
        strategy_id,
        plugins: plugins.map(p => typeof p === 'string' ? p : p.id),
        tenant_id
      },
      tenant_id
    );
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: payload
    });
    
    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    // Log the execution completion
    await logSystemEvent(
      'strategy',
      'execution_complete',
      {
        strategy_id,
        execution_id: data.id,
        result: data.success ? 'success' : 'error',
        tenant_id
      },
      tenant_id
    );
    
    return data;
  } catch (err: any) {
    console.error('Error executing strategy:', err);
    
    // Log the execution error
    await logSystemEvent(
      'strategy',
      'execution_error',
      {
        error: err.message,
        strategy_id: input.strategy_id,
        tenant_id: input.tenant_id
      },
      input.tenant_id
    );
    
    return {
      success: false,
      error: err.message,
      status: 'error'
    };
  }
}

export default executeStrategy;
