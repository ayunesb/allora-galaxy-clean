
/**
 * Centralized exports for edge function utilities
 */

// Re-export error handling utilities with fallbacks
export { 
  corsHeaders,
  handleExecutionError,
  handleCorsPreflightRequest,
  generateRequestId,
  createSuccessResponse,
  createErrorResponse,
  type ErrorResponseData,
  type SuccessResponseData
} from './errorHandler';

// Re-export environment utilities
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
export { getEnv as getDenoEnv } from '../../supabase/lib/env';

// Export retry logic utilities for edge functions
export { executeWithRetry } from './errorHandler';
