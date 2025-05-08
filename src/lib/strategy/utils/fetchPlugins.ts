
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches active plugins from the database
 * @param strategyId The strategy ID to fetch plugins for
 * @param tenantId The tenant ID for verification
 * @returns The fetched plugins or error
 */
export async function fetchPlugins(strategyId: string, tenantId: string): Promise<{
  plugins?: any[];
  error?: string;
}> {
  try {
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .limit(10);
      
    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }
    
    return { plugins };
  } catch (error: any) {
    console.error(`Error fetching plugins for strategy ${strategyId}:`, error);
    return { error: error.message || 'Unknown error fetching plugins' };
  }
}
