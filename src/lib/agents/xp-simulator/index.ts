import { useState } from "react";
import { useToast } from "@/lib/notifications/toast";
import { simulateVotes } from "./voteSimulator";
import { simulateLogs } from "./logSimulator";
import { updateAgentXp, resetAgentXp, checkAgentEvolution } from "./xpManager";
import type { SimulateXpOptions, XpAccumulationResult } from "./types";

/**
 * Hook to help simulate agent XP accumulation for testing purposes
 */
export function useAgentXpSimulator() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResults, setLastResults] = useState<XpAccumulationResult | null>(
    null,
  );
  const { notifyError, notifySuccess } = useToast();

  /**
   * Simulate XP accumulation through both votes and logs
   */
  const simulateXpAccumulation = async (
    options: SimulateXpOptions,
  ): Promise<XpAccumulationResult | null> => {
    setIsLoading(true);
    try {
      const {
        agent_version_id,
        tenant_id,
        xp_amount = 100,
        upvotes = 1,
        downvotes = 0,
        simulate_logs = true,
        log_count = 5,
      } = options;

      // Simulate votes
      const votesResult = await simulateVotes({
        agent_version_id,
        tenant_id,
        upvotes,
        downvotes,
      });

      // Simulate logs if requested
      let logsResult = null;
      if (simulate_logs) {
        logsResult = await simulateLogs({
          agent_version_id,
          tenant_id,
          xp_amount,
          log_count,
        });
      }

      // Update agent version with XP
      const xpUpdate = await updateAgentXp(
        agent_version_id,
        xp_amount,
        upvotes,
        downvotes,
      );

      if (!xpUpdate) {
        throw new Error("Failed to update agent XP");
      }

      // Check if agent is eligible for promotion
      const promotionCheck = await checkAgentEvolution(tenant_id);

      const results: XpAccumulationResult = {
        votesResult,
        logsResult,
        xpUpdated: {
          agent_version_id,
          previous: xpUpdate.previous?.xp ?? 0,
          current: xpUpdate.current?.xp ?? 0,
          delta: { 
            xp: xp_amount, 
            upvotes, 
            downvotes 
          },
        },
        promotionCheck,
      };

      setLastResults(results);

      notifySuccess(
        `XP Accumulation Simulated: Agent updated with ${xp_amount} XP and ${upvotes} upvotes`,
      );

      return results;
    } catch (error) {
      console.error("Error simulating XP accumulation:", error);
      notifyError(
        `Error simulating XP accumulation: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    simulateVotes,
    simulateLogs,
    simulateXpAccumulation,
    resetAgentXp,
    isLoading,
    lastResults,
  };
}

// Re-export all the simulator functions for direct usage
export * from "./types";
export * from "./voteSimulator";
export * from "./logSimulator";
export * from "./xpManager";
