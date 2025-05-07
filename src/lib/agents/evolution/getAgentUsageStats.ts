
import { supabase } from '@/integrations/supabase/client';

/**
 * Count agent usage in recent executions
 */
export async function getAgentUsageStats(days = 30) {
  try {
    const { data: usageStats, error } = await supabase
      .from('plugin_logs')
      .select('agent_version_id, status, count(*)')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .is('status', 'success')
      .groupBy('agent_version_id, status');
      
    if (error) throw error;
    return usageStats || [];
  } catch (error) {
    console.error('Error getting agent usage stats:', error);
    return [];
  }
}
