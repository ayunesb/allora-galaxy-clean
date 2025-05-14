
/**
 * Error handling system for Allora OS
 */

// Export error types
export * from './errorTypes';

// Export error handler
export { 
  ErrorHandler,
  handleError,
  handleSupabaseError,
  handleEdgeFunctionError
} from './ErrorHandler';

// Export hooks
export { useErrorHandler, withErrorHandling } from './useErrorHandler';
export { useDataFetching, useStableFetching } from './useDataFetching';

// Export utilities
export { 
  withRetry, 
  createRetryableFunction, 
  getCircuitBreakerStatus,
  resetCircuitBreaker 
} from './retryUtils';

// Export components - move these from direct imports to re-exported components
export { default as ErrorBoundary } from '@/components/errors/ErrorBoundary';
export { default as ErrorFallback } from '@/components/errors/ErrorFallback';
export { default as PageErrorBoundary } from '@/components/errors/PageErrorBoundary';
export { default as ErrorState } from '@/components/ui/error-state';
export { default as AsyncButton } from '@/components/ui/async-button';

// Re-export BetterToast for convenience
export { 
  notifySuccess, 
  notifyError, 
  notifyInfo, 
  notifyWarning 
} from '@/components/ui/BetterToast';
