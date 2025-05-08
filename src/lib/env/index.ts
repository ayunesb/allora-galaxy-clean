
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
  corsHeaders
} from './envUtils';

export {
  validateCoreEnv,
  validateAllEnv,
  getCoreEnvValues,
  getAllEnvValues,
  ENV_NAMES
} from './config';

// Export environment manager for backward compatibility
export * from './envManager';
