
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { Plugin } from '@/types';

/**
 * Fetches plugins for a specific strategy
 * 
 * @param strategyId The ID of the strategy to fetch plugins for
 * @param tenantId The tenant ID
 * @returns Array of plugins
 */
export async function fetchPluginsForStrategy(strategyId: string, tenantId: string): Promise<Plugin[]> {
  try {
    // Log the plugin fetch attempt
    await logSystemEvent('strategy' as any, 'info', {
      strategy_id: strategyId
    }, tenantId);

    // Fetch available plugins for this tenant
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('tenant_id', tenantId)
      .or(`tenant_id.is.null,status.eq.active`);

    if (error) {
      throw new Error(`Failed to fetch plugins: ${error.message}`);
    }

    // Log the successful fetch
    await logSystemEvent('strategy' as any, 'info', {
      strategy_id: strategyId,
      plugin_count: data?.length || 0
    }, tenantId);

    return data as Plugin[];
  } catch (err: any) {
    console.error('Error fetching plugins:', err);
    
    // Log the error
    await logSystemEvent('strategy' as any, 'error', {
      strategy_id: strategyId,
      error: err.message
    }, tenantId);
    
    return [];
  }
}
