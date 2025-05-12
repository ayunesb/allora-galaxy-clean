
/**
 * Centralized exports for edge function utilities
 */

// Import from errorHandler
import { 
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
} from './errorHandler';

// Re-export error handling utilities
export { 
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
};

// Import and re-export corsHeaders separately to avoid circular references
import { corsHeaders as corsHeadersFromEnv } from '../env/environment';
export const corsHeaders = corsHeadersFromEnv;

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
  getBaseUrl,
  getSafeEnv
} from '../env/envUtils';

// Re-export utility functions for edge function environment handling
export {
  safeGetDenoEnv,
  getEdgeEnv,
  getEdgeEnvironment
} from '../env/safeEdgeEnv';
