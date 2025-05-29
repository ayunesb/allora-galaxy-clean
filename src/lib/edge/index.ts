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
  type SuccessResponseData,
} from "./errorHandler";

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
  getSafeEnv,
} from "../env/envUtils";

// Re-export utility functions for edge function environment handling
export {
  safeGetDenoEnv,
  getEdgeEnv,
  getEdgeEnvironment,
} from "../env/safeEdgeEnv";
