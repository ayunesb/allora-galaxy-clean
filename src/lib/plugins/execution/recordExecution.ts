
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Records a plugin or strategy execution in the database
 * 
 * @param data Execution data to record
 * @returns The created execution record or undefined if creation failed
 */
export async function recordExecution(data: ExecutionRecordInput): Promise<{ id: string } | undefined> {
  try {
    // Convert camelCase to snake_case for database insertion
    const recordData = {
      id: data.id,
      tenant_id: data.tenantId,
      status: data.status,
      type: data.type,
      strategy_id: data.strategyId,
      plugin_id: data.pluginId,
      agent_version_id: data.agentVersionId,
      executed_by: data.executedBy,
      input: data.input,
      output: data.output,
      execution_time: data.executionTime,
      xp_earned: data.xpEarned,
      error: data.error
    };

    // Insert or update the execution record
    const operation = data.id 
      ? supabase.from('execution_logs').update(recordData).eq('id', data.id)
      : supabase.from('execution_logs').insert(recordData);
    
    const { data: result, error } = data.id 
      ? await operation.select('id').single()
      : await operation.select('id').single();

    if (error) {
      console.error('Error recording execution:', error);
      return undefined;
    }

    // Log the execution event
    await logSystemEvent(
      data.tenantId,
      data.type,
      `${data.type}_execution_${data.status}`,
      {
        strategy_id: data.strategyId,
        plugin_id: data.pluginId,
        agent_version_id: data.agentVersionId,
        status: data.status,
        has_error: !!data.error,
        execution_time: data.executionTime,
        xp_earned: data.xpEarned
      }
    ).catch(err => {
      console.warn('Failed to log execution event:', err);
      // Non-critical error, continue execution
    });

    return result;
  } catch (err) {
    console.error('Unexpected error recording execution:', err);
    return undefined;
  }
}
