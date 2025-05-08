
import { supabase } from '@/integrations/supabase/client';

/**
 * Record a log execution in the database
 * @param log - Log data
 * @returns The created log record
 */
export async function recordLogExecution(log: {
  pluginId: string;
  tenantId: string;
  status: "success" | "failure";
  input?: Record<string, any>;
  output?: any;
  error?: string;
  executionTime: number;
  xpEarned: number;
  strategyId?: string;
  agentVersionId?: string;
}): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('plugin_logs')
      .insert({
        tenant_id: log.tenantId,
        plugin_id: log.pluginId,
        strategy_id: log.strategyId || null,
        agent_version_id: log.agentVersionId || null,
        status: log.status,
        input: log.input || null,
        output: log.output || null,
        execution_time: log.executionTime,
        xp_earned: log.xpEarned,
        error: log.error || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording plugin log:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error recording plugin log:', error);
    throw error;
  }
}
