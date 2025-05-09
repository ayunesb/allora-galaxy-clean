
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch agent versions that are candidates for evolution
 * @param tenantId The tenant ID
 * @returns Array of agent versions
 */
export async function getAgentsForEvolution(tenantId: string) {
  try {
    // Get agent versions that are active and have sufficient usage
    const { data, error } = await supabase
      .from('agent_versions')
      .select(`
        id,
        version,
        prompt,
        plugin_id,
        created_at,
        upvotes,
        downvotes,
        xp,
        status
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .gte('xp', 100) // Only consider agents with sufficient usage
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching agents for evolution:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAgentsForEvolution:', error);
    return [];
  }
}
