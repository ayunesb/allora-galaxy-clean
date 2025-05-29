import { supabase } from "@/integrations/supabase/client";

/**
 * Get plugins eligible for optimization based on usage and performance
 * @param tenantId The tenant ID to filter plugins by
 * @returns Array of plugins eligible for optimization
 */
export async function getPluginsForOptimization(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from("plugins")
      .select(
        `
        id,
        name,
        xp,
        roi,
        agent_versions!inner (
          id,
          version,
          status
        )
      `,
      )
      .eq("tenant_id", tenantId)
      .eq("agent_versions.status", "active")
      .order("xp", { ascending: false });

    if (error) {
      console.error("Error fetching plugins for optimization:", error);
      return [];
    }

    // Filter for plugins that need optimization
    const eligiblePlugins = data.filter((plugin) => {
      // Plugins with at least 100 XP and multiple versions
      return plugin.xp >= 100 && plugin.agent_versions.length > 0;
    });

    return eligiblePlugins;
  } catch (error) {
    console.error("Error in getPluginsForOptimization:", error);
    return [];
  }
}
