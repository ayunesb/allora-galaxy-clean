
import { ExecutionRecordInput, LogStatus } from '@/types/fixed';
import { supabase } from '@/lib/supabase';

/**
 * Record a new execution
 */
export async function recordExecution(
  input: ExecutionRecordInput,
  retries = 3
): Promise<{ id: string; }> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .insert({
        tenant_id: input.tenantId,
        status: input.status,
        type: input.type,
        strategy_id: input.strategyId,
        plugin_id: input.pluginId,
        agent_version_id: input.agentVersionId,
        executed_by: input.executedBy,
        input: input.input || {},
        output: input.output || {},
        error: input.error
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to record execution: ${error.message}`);
    }
    
    return { id: data.id };
    
  } catch (error) {
    if (retries > 0) {
      // Add exponential backoff
      const backoff = Math.pow(2, 4 - retries) * 100;
      await new Promise(resolve => setTimeout(resolve, backoff));
      return recordExecution(input, retries - 1);
    }
    throw error;
  }
}

/**
 * Update an existing execution
 */
export async function updateExecution(
  id: string,
  updates: {
    status?: LogStatus;
    output?: any;
    error?: string;
    executionTime?: number;
    xpEarned?: number;
  }
): Promise<{ id: string; status?: string }> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .update({
        status: updates.status,
        output: updates.output,
        error: updates.error,
        execution_time: updates.executionTime,
        xp_earned: updates.xpEarned,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to update execution: ${error.message}`);
    }
    
    return { 
      id: data.id,
      status: data.status
    };
    
  } catch (error) {
    console.error("Error updating execution:", error);
    throw error;
  }
}

/**
 * Get an execution by ID
 */
export async function getExecution(id: string) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(`Failed to get execution: ${error.message}`);
    }
    
    return data;
    
  } catch (error) {
    console.error("Error getting execution:", error);
    return null;
  }
}

/**
 * Get recent executions for a tenant
 */
export async function getRecentExecutions(tenantId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      throw new Error(`Failed to get recent executions: ${error.message}`);
    }
    
    return data || [];
    
  } catch (error) {
    console.error("Error getting recent executions:", error);
    return [];
  }
}
