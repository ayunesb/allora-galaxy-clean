
import { supabase } from '@/integrations/supabase/client';

/**
 * Get all plugins that need optimization
 */
export async function getPluginsForOptimization() {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('id')
      .eq('status', 'active');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting plugins for optimization:', error);
    return [];
  }
}
