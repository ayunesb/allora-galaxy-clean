import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Represents a plugin in the system
 */
export interface Plugin {
  /** Unique identifier for the plugin */
  id: string;
  /** Display name of the plugin */
  name: string;
  /** Optional description of what the plugin does */
  description?: string;
  /** Optional icon identifier or URL */
  icon?: string;
  /** Optional category for grouping plugins */
  category?: string;
  /** Experience points earned by using this plugin */
  xp: number;
  /** Return on investment score for the plugin */
  roi: number;
  /** Current status of the plugin (active, deprecated, etc.) */
  status: string;
}

/**
 * Fetches plugins associated with a specific strategy
 *
 * This function retrieves all plugins that are connected to a strategy,
 * maintaining their defined order and returning their full metadata.
 * It handles errors gracefully and logs system events for monitoring.
 *
 * @param strategyId The ID of the strategy to fetch plugins for
 * @returns Promise resolving to an array of Plugin objects
 *
 * @example
 * ```typescript
 * // Fetch plugins for a strategy
 * const plugins = await fetchPluginsForStrategy('strategy-123');
 *
 * // Display plugin information
 * plugins.forEach(plugin => {
 *   console.log(`${plugin.name} (${plugin.xp} XP, ROI: ${plugin.roi})`);
 * });
 * ```
 */
export async function fetchPluginsForStrategy(
  strategyId: string,
): Promise<Plugin[]> {
  try {
    // Log the fetch attempt
    await logSystemEvent("strategy", "info", {
      description: `Fetching plugins for strategy ${strategyId}`,
      strategy_id: strategyId,
    });

    // Fetch plugins connected to this strategy
    const { data: strategyPlugins, error: strategyPluginsError } =
      await supabase
        .from("strategy_plugins")
        .select("plugin_id, position")
        .eq("strategy_id", strategyId)
        .order("position", { ascending: true });

    if (strategyPluginsError) {
      throw new Error(
        `Failed to fetch strategy plugins: ${strategyPluginsError.message}`,
      );
    }

    if (!strategyPlugins || strategyPlugins.length === 0) {
      return [];
    }

    const pluginIds = strategyPlugins.map((sp) => sp.plugin_id);

    // Fetch the full plugin data
    const { data: plugins, error: pluginsError } = await supabase
      .from("plugins")
      .select("id, name, description, icon, category, xp, roi, status")
      .in("id", pluginIds);

    if (pluginsError) {
      throw new Error(`Failed to fetch plugins: ${pluginsError.message}`);
    }

    // Sort plugins to match the order in strategy_plugins
    const orderedPlugins = plugins
      ? (pluginIds
          .map((id) => plugins.find((plugin) => plugin.id === id))
          .filter(Boolean) as Plugin[])
      : [];

    return orderedPlugins;
  } catch (error: any) {
    console.error("Error fetching plugins for strategy:", error);
    return [];
  }
}
