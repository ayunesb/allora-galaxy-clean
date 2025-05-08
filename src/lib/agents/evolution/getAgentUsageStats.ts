
import { supabase } from '@/integrations/supabase/client';

/**
 * Count agent usage in recent executions
 */
export async function getAgentUsageStats(days = 30) {
  try {
    // Base query for plugin logs from recent days
    const query = supabase
      .from('plugin_logs')
      .select('agent_version_id, status, count(*)')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .is('status', 'success');
    
    // Get query result (the groupBy must be done client-side as Supabase JS doesn't support it)
    const { data, error } = await query;
      
    if (error) throw error;
    
    // Process the data to simulate a groupBy operation
    const groupedData = data?.reduce((acc, item) => {
      const key = `${item.agent_version_id}-${item.status}`;
      if (!acc[key]) {
        acc[key] = { 
          agent_version_id: item.agent_version_id, 
          status: item.status,
          count: 0
        };
      }
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>) || {};
    
    return Object.values(groupedData);
  } catch (error) {
    console.error('Error getting agent usage stats:', error);
    return [];
  }
}
