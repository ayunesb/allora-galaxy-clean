import { getAgentUsageStats } from "./getAgentUsageStats";

export interface AgentPerformanceMetrics {
  successRate: number;
  averageXp: number;
  totalExecutions: number;
  errorRate: number;
  averageExecutionTime: number;
}

/**
 * Calculate performance metrics for an agent
 * @param agentId The ID of the agent version
 * @returns Performance metrics
 */
export async function calculatePerformance(
  agentId: string,
): Promise<AgentPerformanceMetrics> {
  try {
    const logs = await getAgentUsageStats(agentId);

    if (logs.length === 0) {
      return {
        successRate: 0,
        averageXp: 0,
        totalExecutions: 0,
        errorRate: 0,
        averageExecutionTime: 0,
      };
    }

    const totalExecutions = logs.length;
    const successfulExecutions = logs.filter(
      (log) => log.status === "success",
    ).length;
    const failedExecutions = logs.filter(
      (log) => log.status === "failure",
    ).length;

    const totalXp = logs.reduce((sum, log) => sum + (log.xp_earned || 0), 0);
    const totalExecutionTime = logs.reduce(
      (sum, log) => sum + (log.execution_time || 0),
      0,
    );

    return {
      successRate: successfulExecutions / totalExecutions,
      averageXp: totalXp / totalExecutions,
      totalExecutions,
      errorRate: failedExecutions / totalExecutions,
      averageExecutionTime: totalExecutionTime / totalExecutions,
    };
  } catch (error) {
    console.error("Error calculating agent performance:", error);
    return {
      successRate: 0,
      averageXp: 0,
      totalExecutions: 0,
      errorRate: 1, // Assume worst case for error
      averageExecutionTime: 0,
    };
  }
}
