
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface ExecutionParams {
  tenant_id: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: 'success' | 'failure' | 'pending';
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
}

/**
 * Record an execution in the executions table
 */
export async function recordExecution(params: ExecutionParams): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('executions')
      .insert({
        tenant_id: params.tenant_id,
        type: params.type,
        status: params.status,
        strategy_id: params.strategy_id || null,
        plugin_id: params.plugin_id || null,
        agent_version_id: params.agent_version_id || null,
        executed_by: params.executed_by || null,
        input: params.input as Json || null,
        output: params.output as Json || null,
        error: params.error || null,
        execution_time: params.execution_time || 0,
        xp_earned: params.xp_earned || 0
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error recording execution:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Unexpected error in recordExecution:", error);
    return null;
  }
}
