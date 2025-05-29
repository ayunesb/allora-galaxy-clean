import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches active plugins for a tenant
 * @param tenantId The tenant ID to fetch plugins for
 * @returns An array of active plugins
 */
export async function getActivePlugins(tenantId: string) {
  try {
    const { data: plugins, error } = await supabase
      .from("plugins")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch plugins: ${error.message}`);
    }

    return plugins || [];
  } catch (error) {
    console.error("Error fetching active plugins:", error);
    return [];
  }
}
