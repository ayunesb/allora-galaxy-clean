
import { supabase } from '@/lib/supabase';
import { LogStatus } from '@/types/fixed';

export interface ExecutionRecordInput {
  tenantId: string;
  status: LogStatus;
  type: 'strategy' | 'plugin' | 'agent';
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

/**
 * Record a new execution in the database
 */
export async function recordExecution(input: ExecutionRecordInput, retryCount = 0): Promise<any> {
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
        executed_by: input.executedBy || 'system',
        input: input.input || {},
        output: input.output || {},
        error: input.error
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    // Retry logic for transient database errors
    if (retryCount < 3) {
      console.warn(`Database error recording execution, retrying (${retryCount + 1}/3):`, error);
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return recordExecution(input, retryCount + 1);
    }
    
    console.error('Failed to record execution after retries:', error);
    return {
      id: `error-${Date.now()}`,
      error: error.message
    };
  }
}

/**
 * Update an existing execution record
 */
export async function updateExecution(
  executionId: string, 
  updates: {
    status?: LogStatus;
    output?: Record<string, any>;
    error?: string;
    executionTime?: number;
    xpEarned?: number;
  }
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .update(updates)
      .eq('id', executionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating execution:', error);
    return {
      error: error.message
    };
  }
}

/**
 * Get an execution by ID
 */
export async function getExecution(executionId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching execution:', error);
    return null;
  }
}

/**
 * Get recent executions for a tenant
 */
export async function getRecentExecutions(tenantId: string, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching recent executions:', error);
    return [];
  }
}
