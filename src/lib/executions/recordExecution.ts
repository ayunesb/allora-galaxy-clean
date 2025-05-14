
import { supabaseWithErrorHandler } from '@/lib/supabase';
import { ExecutionRecordInput } from '@/types/execution';

/**
 * Record an execution in the database
 * @param data Execution data to record
 * @returns Promise resolving to success status and data
 */
export async function recordExecution(data: ExecutionRecordInput): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    // Validate required fields
    if (!data.tenantId) {
      return { success: false, error: 'Tenant ID is required' };
    }
    
    if (!data.type) {
      return { success: false, error: 'Execution type is required' };
    }
    
    if (!data.status) {
      return { success: false, error: 'Status is required' };
    }
    
    // Insert execution record
    const { data: execution, error } = await supabaseWithErrorHandler
      .from('executions')
      .insert({
        tenant_id: data.tenantId,
        strategy_id: data.strategyId,
        plugin_id: data.pluginId,
        agent_version_id: data.agentVersionId,
        executed_by: data.executedBy,
        type: data.type,
        status: data.status,
        input: data.input,
        output: data.output,
        error: data.error,
        execution_time: data.executionTime || 0,
        xp_earned: data.xpEarned || 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording execution:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: execution };
  } catch (err: any) {
    console.error('Error recording execution:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}
