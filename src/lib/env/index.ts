
// Re-export all environment utility functions
export * from './envUtils';
export * from './environment';

// Legacy compatibility
import { getEnv, getEnvWithDefault } from './envUtils';
export { getEnv, getEnvWithDefault };
