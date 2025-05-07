
import { supabase } from '@/integrations/supabase/client';

/**
 * Record a log execution in the database
 * @param log - Log data
 * @returns The created log record
 */
export async function recordLogExecution(log: {
  tenantId: string;
  pluginId: string;
  strategyId: string;
  agentVersionId: string;
  executedBy: string;
  status: "success" | "failure";
  type: "agent" | "plugin" | "strategy";
  input: Record<string, any>;
  output: any;
  executionTime: number;
  xpEarned: number;
  error: string;
}): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('plugin_logs')
      .insert({
        tenant_id: log.tenantId,
        plugin_id: log.pluginId,
        strategy_id: log.strategyId,
        agent_version_id: log.agentVersionId,
        executed_by: log.executedBy,
        status: log.status,
        type: log.type,
        input: log.input,
        output: log.output,
        execution_time: log.executionTime,
        xp_earned: log.xpEarned,
        error: log.error
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
