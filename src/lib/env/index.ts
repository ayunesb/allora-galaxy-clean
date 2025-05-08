
/**
 * Centralized environment variable management
 * This file exports a unified interface for accessing environment variables
 * across different environments (browser, edge functions, Node.js)
 */

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

// No longer export old envManager functions - use the new utilities instead
