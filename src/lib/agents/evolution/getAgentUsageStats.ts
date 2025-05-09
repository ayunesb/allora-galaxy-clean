
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches usage statistics for an agent
 * @param agentId The ID of the agent version
 * @returns Array of usage logs
 */
export async function getAgentUsageStats(agentId: string) {
  const { data, error } = await supabase
    .from('plugin_logs')
    .select('status, execution_time, created_at, error, xp_earned')
    .eq('agent_version_id', agentId);
    
  if (error) {
    console.error('Error fetching agent usage statistics:', error);
    throw error;
  }
  
  return data || [];
}
