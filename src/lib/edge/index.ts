
/**
 * Centralized exports for edge function utilities
 */

// Re-export error handling utilities
export { 
  corsHeaders,
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
} from './errorHandler';

// Re-export environment variables utilities
export {
  ENV,
  getEnv,
  getEnvVar,
  getEnvWithDefault,
  corsHeaders as envCorsHeaders,
  isProduction,
  getBaseUrl,
  getSafeEnv
} from '../env/envUtils';

// Re-export utility functions for edge function environment handling
export {
  safeGetDenoEnv,
  getEdgeEnv,
  getEdgeEnvironment
} from '../env/safeEdgeEnv';

// Export safe environment getter for edge functions
export { getDenoEnv } from '../strategy/utils/environmentUtils';
