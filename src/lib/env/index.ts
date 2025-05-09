
/**
 * Centralized environment variable management
 * This file exports a unified interface for accessing environment variables
 * across different environments (browser, edge functions, Node.js)
 */

// Export all environment utilities from envUtils
export {
  ENV,
  getEnv,
  getEnvVar,
  getEnvWithDefault,
  corsHeaders,
  isProduction,
  getBaseUrl,
  getSafeEnv
} from './envUtils';

export {
  validateCoreEnv,
  validateAllEnv,
  getCoreEnvValues,
  getAllEnvValues,
  ENV_NAMES
} from './config';

// Export the safe Deno env getter function for edge functions
export { safeGetDenoEnv } from './safeEdgeEnv';

// Export specific environment configurations for different contexts
export { getEnvironmentVariable } from './environment';
