// Remove unused imports and fix unused parameters
import { supabase } from "@/lib/supabase";
import { Plugin } from "@/types/plugin";

/**
 * Fetch plugins available to a tenant
 */
export async function fetchAvailablePlugins(
  tenantId: string,
): Promise<Plugin[]> {
  try {
    const { data, error } = await supabase
      .from("plugins")
      .select("*")
      .eq("tenant_id", tenantId)
      .or("tenant_id.is.null")
      .eq("status", "active");

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error fetching plugins:", err);
    return [];
  }
}

/**
 * Get the latest agent version for a plugin
 */
export async function getLatestAgentVersion(pluginId: string) {
  try {
    const { data, error } = await supabase
      .from("agent_versions")
      .select("*")
      .eq("plugin_id", pluginId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error fetching latest agent version:", err);
    return null;
  }
}

/**
 * Calculate plugin execution success rate
 */
export async function calculatePluginSuccessRate(
  pluginId: string,
  tenantId: string,
): Promise<number> {
  try {
    // Get total executions
    const { data: totalData, error: totalError } = await supabase
      .from("plugin_logs")
      .select("count", { count: "exact" })
      .eq("plugin_id", pluginId)
      .eq("tenant_id", tenantId);

    if (totalError) throw totalError;

    // Get successful executions
    const { data: successData, error: successError } = await supabase
      .from("plugin_logs")
      .select("count", { count: "exact" })
      .eq("plugin_id", pluginId)
      .eq("tenant_id", tenantId)
      .eq("status", "success");

    if (successError) throw successError;

    const total = totalData[0]?.count || 0;
    const success = successData[0]?.count || 0;

    return total > 0 ? (success / total) * 100 : 0;
  } catch (err) {
    console.error("Error calculating plugin success rate:", err);
    return 0;
  }
}
