
// Re-export all evolution functionality from this central file
export * from './getAgentsForEvolution';
export * from './getAgentUsageStats';
export * from './calculatePerformance';
export * from './checkEvolutionNeeded';
export * from './createEvolvedAgent';
export * from './deactivateOldAgent';
export { autoEvolveAgents } from './autoEvolveAgents';
export { getPluginsForOptimization } from './getPluginsForOptimization';
export { getFeedbackComments } from './getFeedbackComments';

// Explicitly re-export to resolve ambiguity
export type { EvolutionResult } from './createEvolvedAgent';
