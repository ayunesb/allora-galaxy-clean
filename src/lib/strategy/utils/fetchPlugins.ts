
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  xp: number;
  roi: number;
  status: string;
}

export async function fetchPluginsForStrategy(strategyId: string): Promise<Plugin[]> {
  try {
    // Log the fetch attempt
    await logSystemEvent(
      'strategy',
      'info',
      {
        description: `Fetching plugins for strategy ${strategyId}`,
        strategy_id: strategyId
      }
    );

    // Fetch plugins connected to this strategy
    const { data: strategyPlugins, error: strategyPluginsError } = await supabase
      .from('strategy_plugins')
      .select('plugin_id, position')
      .eq('strategy_id', strategyId)
      .order('position', { ascending: true });

    if (strategyPluginsError) {
      throw new Error(`Failed to fetch strategy plugins: ${strategyPluginsError.message}`);
    }

    if (!strategyPlugins || strategyPlugins.length === 0) {
      return [];
    }

    const pluginIds = strategyPlugins.map(sp => sp.plugin_id);

    // Fetch the full plugin data
    const { data: plugins, error: pluginsError } = await supabase
      .from('plugins')
      .select('id, name, description, icon, category, xp, roi, status')
      .in('id', pluginIds);

    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }

    // Sort plugins to match the order in strategy_plugins
    const orderedPlugins = plugins ? pluginIds.map(id => 
      plugins.find(plugin => plugin.id === id)
    ).filter(Boolean) as Plugin[] : [];

    return orderedPlugins;
  } catch (error: any) {
    console.error('Error fetching plugins for strategy:', error);
    return [];
  }
}
