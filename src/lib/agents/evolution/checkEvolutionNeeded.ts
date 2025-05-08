
import { AgentPerformanceMetrics } from './autoEvolveAgents';

/**
 * Check if an agent should be evolved based on performance metrics
 * @param metrics The agent's performance metrics
 * @returns boolean indicating if evolution is needed
 */
export function checkEvolutionNeeded(metrics: AgentPerformanceMetrics): boolean {
  return metrics.needsEvolution;
}
