
// Re-export all environment utility functions
export * from './envUtils';
export * from './environment';
export * from './safeEdgeEnv';

// Legacy compatibility - explicit exports to avoid ambiguity
export { getEnv, getEnvWithDefault } from './envUtils';
