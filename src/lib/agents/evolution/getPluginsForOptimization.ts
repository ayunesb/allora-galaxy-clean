
import { supabase } from '@/integrations/supabase/client';

/**
 * Get plugins that might benefit from optimization
 * @param tenantId Optional tenant ID to filter plugins
 * @param limit Maximum number of plugins to return
 * @returns Array of plugins with their performance metrics
 */
export async function getPluginsForOptimization(
  tenantId?: string,
  limit: number = 10
) {
  // First get plugins
  const pluginQuery = supabase
    .from('plugins')
    .select('id, name, description, xp, roi, status')
    .eq('status', 'active');
    
  if (tenantId) {
    pluginQuery.eq('tenant_id', tenantId);
  }
  
  const { data: plugins, error } = await pluginQuery.limit(limit);
  
  if (error) {
    console.error('Error fetching plugins for optimization:', error);
    throw error;
  }
  
  // For each plugin, get latest agent version and performance stats
  const result = [];
  
  for (const plugin of plugins || []) {
    try {
      // Get latest agent version
      const { data: agents } = await supabase
        .from('agent_versions')
        .select('id, version, created_at, upvotes, downvotes')
        .eq('plugin_id', plugin.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
        
      const agent = agents?.[0];
      
      if (agent) {
        // Get performance stats from logs
        const { data: stats } = await supabase
          .from('plugin_logs')
          .select('status, xp_earned')
          .eq('plugin_id', plugin.id)
          .eq('agent_version_id', agent.id)
          .limit(100);
          
        const successRate = stats?.length ? 
          stats.filter(s => s.status === 'success').length / stats.length : 
          0;
          
        result.push({
          ...plugin,
          agent,
          stats: {
            count: stats?.length || 0,
            successRate,
            averageXp: stats?.length ? 
              stats.reduce((sum, s) => sum + (s.xp_earned || 0), 0) / stats.length : 
              0
          }
        });
      }
    } catch (err) {
      console.error(`Error processing plugin ${plugin.id}:`, err);
    }
  }
  
  return result;
}
