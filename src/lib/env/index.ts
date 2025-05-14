
/**
 * Centralized environment variables handling
 * This file re-exports all environment utilities from their respective modules
 */

// Re-export from envUtils with explicit naming to avoid ambiguity
export { 
  getEnv,
  getEnvWithDefault,
  isEnvTrue,
  isDevelopment,
  isTest,
  isProduction,
  getEnvsByPrefix,
  getSafeEnv,
  ENV,
  corsHeaders,
  getBaseUrl
} from './envUtils';

// Re-export from environment with explicit naming
export {
  getEnvironmentVariable,
  validateEnvironment
} from './environment';

// Re-export from safeEdgeEnv
export {
  safeGetDenoEnv,
  getEdgeEnv,
  getEdgeEnvironment
} from './safeEdgeEnv';
