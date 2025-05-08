
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches plugins associated with a strategy
 * @param strategyId The ID of the strategy to fetch plugins for
 * @param tenantId The tenant ID for RLS verification
 * @returns An object containing plugins array and any error
 */
export async function fetchPlugins(
  strategyId: string, 
  tenantId: string
) {
  try {
    // Verify tenant access first
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies')
      .select('id')
      .eq('id', strategyId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (strategyError) {
      return { plugins: null, error: `Strategy access denied: ${strategyError.message}` };
    }
    
    // Fetch active plugins for the tenant
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });
    
    if (pluginsError) {
      return { plugins: null, error: `Failed to fetch plugins: ${pluginsError.message}` };
    }
    
    return { plugins, error: null };
  } catch (error: any) {
    return { plugins: null, error: `Unexpected error fetching plugins: ${error.message}` };
  }
}
