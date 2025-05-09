
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches agent versions that are eligible for evolution
 * @param tenantId Optional tenant ID to filter agents
 * @param batchSize Maximum number of agents to fetch
 * @returns Array of agent versions
 */
export async function getAgentsForEvolution(tenantId?: string, batchSize: number = 10) {
  const query = supabase
    .from('agent_versions')
    .select(`
      id,
      plugin_id,
      version,
      prompt,
      created_at,
      tenant_id,
      upvotes,
      downvotes,
      status
    `)
    .eq('status', 'active');
    
  if (tenantId) {
    query.eq('tenant_id', tenantId);
  }
    
  query.limit(batchSize);
    
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching agents for evolution:', error);
    throw error;
  }
  
  return data || [];
}
