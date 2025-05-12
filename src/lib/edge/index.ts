
/**
 * Centralized exports for edge function utilities
 */

// Import corsHeaders from errorHandler 
import { 
  corsHeaders,
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
} from './errorHandler';

// Re-export all error handling utilities
export { 
  handleEdgeError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  corsHeaders,
  type ErrorResponseData,
  type SuccessResponseData
};

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
