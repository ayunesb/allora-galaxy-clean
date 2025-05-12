
/**
 * Centralized exports for edge function utilities
 */

// Re-export error handling utilities
export { 
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
} from './errorHandler';

// Import corsHeaders from errorHandler and re-export it
import { corsHeaders as errorHandlerCorsHeaders } from './errorHandler';
export { errorHandlerCorsHeaders as corsHeaders };

// Re-export environment variables utilities
export {
  getEnv,
  getEnvWithDefault,
  isEnvTrue,
  isDevelopment,
  isProduction,
  isTest,
  getEnvsByPrefix,
  ENV,
  corsHeaders as envCorsHeaders,
  getBaseUrl,
  getSafeEnv
} from '../env/envUtils';

// Re-export utility functions for edge function environment handling
export {
  safeGetDenoEnv,
  getEdgeEnv,
  getEdgeEnvironment
} from '../env/safeEdgeEnv';
