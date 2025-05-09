
import { supabase } from '@/integrations/supabase/client';

/**
 * Get all agents that need evolution based on vote ratios
 * @param tenantId Optional tenant ID to filter by
 * @param batchSize Maximum number of agents to return
 * @returns Array of agents that are candidates for evolution
 */
export async function getAgentsForEvolution(
  tenantId?: string,
  batchSize: number = 10
): Promise<any[]> {
  try {
    // Build the query to get active agent versions
    let query = supabase
      .from('agent_versions')
      .select(`
        id,
        plugin_id,
        version,
        prompt,
        status,
        created_at,
        tenant_id
      `)
      .eq('status', 'active');
    
    // Filter by tenant if specified
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    // Limit the batch size
    query = query.limit(batchSize);
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching agents for evolution:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getAgentsForEvolution:', err);
    return [];
  }
}
