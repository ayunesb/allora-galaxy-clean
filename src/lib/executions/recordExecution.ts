
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput } from '@/types/fixed';

/**
 * Record an execution in the database
 * @param data Execution data to record
 * @returns Promise resolving to the created execution or undefined if there was an error
 */
export async function recordExecution(data: ExecutionRecordInput): Promise<{ id: string } | undefined> {
  try {
    // Validate required fields
    if (!data.tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    if (!data.type) {
      throw new Error('Execution type is required');
    }
    
    if (!data.status) {
      throw new Error('Status is required');
    }
    
    // Insert execution record
    const { data: execution, error } = await supabase
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
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return execution as { id: string };
  } catch (err: any) {
    console.error('Error recording execution:', err);
    return undefined;
  }
}
