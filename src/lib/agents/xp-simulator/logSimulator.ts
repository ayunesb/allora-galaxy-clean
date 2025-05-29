import { supabase } from "@/integrations/supabase/client";
import { notify, notifyError } from "@/lib/notifications/toast";
import { generateUuid } from "./types";
import type { SimulateXpOptions, LogSimulationResult } from "./types";

/**
 * Simulates plugin logs for an agent version
 */
export async function simulateLogs({
  agent_version_id,
  tenant_id,
  xp_amount = 100,
  log_count = 5,
}: SimulateXpOptions): Promise<LogSimulationResult | null> {
  try {
    // First get the plugin_id for this agent version
    const { data: agent, error: agentError } = await supabase
      .from("agent_versions")
      .select("plugin_id")
      .eq("id", agent_version_id)
      .single();

    if (agentError || !agent) {
      throw new Error(
        `Error fetching agent: ${agentError?.message || "Agent not found"}`,
      );
    }

    const plugin_id = agent.plugin_id;
    const logs = [];

    // Calculate XP per log
    const xpPerLog = Math.floor(xp_amount / log_count);

    // Generate logs
    for (let i = 0; i < log_count; i++) {
      logs.push({
        id: generateUuid(),
        plugin_id,
        agent_version_id,
        tenant_id,
        execution_id: generateUuid(),
        status: "success",
        xp_earned: xpPerLog,
        context: {
          test: true,
          execution_number: i + 1,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });
    }

    // Insert logs
    const { data, error } = await supabase
      .from("plugin_logs")
      .insert(logs)
      .select();

    if (error) {
      throw new Error(`Error inserting logs: ${error.message}`);
    }

    notify({
      title: "Logs simulated",
      description: `Added ${log_count} logs with total XP ${xp_amount} to agent ${agent_version_id}`,
    });

    return {
      agent_version_id,
      logs: data || [],
      xp_earned: xp_amount,
    };
  } catch (error: unknown) {
    console.error("Error simulating logs:", error);

    notify(
      {
        title: "Error simulating logs",
        description: (error as Error).message,
      },
      { type: "error" },
    );

    notifyError("Simulation failed");

    return null;
  }
}
