import { supabase } from "@/integrations/supabase/client";

/**
 * Get usage statistics for an agent version
 * @param agentId The ID of the agent version
 * @returns Array of plugin logs
 */
export async function getAgentUsageStats(agentId: string) {
  try {
    const { data, error } = await supabase
      .from("plugin_logs")
      .select("status, execution_time, xp_earned, created_at")
      .eq("agent_version_id", agentId);

    if (error) {
      console.error("Error fetching agent usage stats:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAgentUsageStats:", error);
    return [];
  }
}
