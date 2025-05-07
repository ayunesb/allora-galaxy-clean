
import { supabase } from '@/integrations/supabase/client';
import { Plugin } from '@/types/plugin';

/**
 * Get all active plugins
 * @returns Array of active plugins
 */
export async function getActivePlugins(): Promise<Plugin[]> {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error getting active plugins:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting active plugins:', error);
    return [];
  }
}
