
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
export { useDataFetching } from './useDataFetching';

// Export utilities
export { withRetry, createRetryableFunction } from './retryUtils';

// Export components
export { default as ErrorBoundary, withErrorBoundary } from '../components/errors/ErrorBoundary';
export { default as ErrorFallback } from '../components/errors/ErrorFallback';
export { default as PageErrorBoundary } from '../components/errors/PageErrorBoundary';
export { default as ErrorState } from '../components/ui/error-state';
export { default as AsyncButton } from '../components/ui/async-button';

// Re-export BetterToast for convenience
export { 
  notifySuccess, 
  notifyError, 
  notifyInfo, 
  notifyWarning 
} from '@/components/ui/BetterToast';
