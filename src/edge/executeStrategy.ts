
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Interface for executing a strategy
 */
interface StrategyInput {
  strategy_id?: string;
  strategyId?: string;
  plugins?: any[];
  tenant_id?: string;
  tenantId?: string;
  user_id?: string;
  userId?: string;
  input_data?: Record<string, any>;
}

/**
 * Execute a strategy with the given input parameters
 * using Edge Functions
 * 
 * @param input Strategy execution input parameters
 * @returns Promise with execution result
 */
export async function executeStrategy(input: StrategyInput): Promise<any> {
  try {
    const strategy_id = input.strategy_id || input.strategyId;
    const plugins = input.plugins || [];
    const tenant_id = input.tenant_id || input.tenantId;
    const user_id = input.user_id || input.userId;
    const input_data = input.input_data || {};
    
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
        strategy_id: input.strategy_id || input.strategyId,
        tenant_id: input.tenant_id || input.tenantId
      },
      input.tenant_id || input.tenantId
    );
    
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Process the execution response from the edge function
 */
export function processExecutionResponse(response: any): any {
  if (!response) return { success: false, error: 'No response received' };
  
  return {
    success: response.success,
    strategy_id: response.strategy_id,
    execution_id: response.execution_id,
    status: response.status || 'unknown',
    error: response.error,
    execution_time: response.execution_time_ms ? response.execution_time_ms / 1000 : undefined,
    plugins_executed: response.plugins_executed,
    successful_plugins: response.successful_plugins,
    xp_earned: response.xp_earned,
    outputs: response.outputs
  };
}

export default executeStrategy;
