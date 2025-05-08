
import { supabase } from '@/integrations/supabase/client';
import { Plugin } from '@/types/plugin';

/**
 * Fetch plugins to execute for a strategy
 * 
 * @param strategyId Strategy ID
 * @param tenantId Tenant ID
 * @returns Object with plugins array or error
 */
export async function fetchPlugins(strategyId: string, tenantId: string): Promise<{ plugins?: Plugin[]; error?: string }> {
  try {
    // Fetch active plugins for the strategy
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return {
        plugins: [],
        error: 'No active plugins found for the strategy'
      };
    }
    
    return { plugins: data as Plugin[] };
  } catch (error: any) {
    console.error('Error fetching plugins:', error);
    return { error: error.message || 'Failed to fetch plugins' };
  }
}
