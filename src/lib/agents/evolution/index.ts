// Re-export all evolution functionality from this central file
export * from "./getAgentsForEvolution";
export * from "./getAgentUsageStats";
export * from "./calculatePerformance";
export * from "./checkEvolutionNeeded";
export * from "./createEvolvedAgent";
export * from "./deactivateOldAgent";
export * from "./getFeedbackComments";
export { autoEvolveAgents } from "./autoEvolveAgents";
export { getPluginsForOptimization } from "./getPluginsForOptimization";

// Explicitly re-export types to ensure type safety
export type { EvolutionResult, AgentEvolutionResult } from "./autoEvolveAgents";
