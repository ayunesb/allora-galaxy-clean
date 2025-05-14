
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

// Export components
export { default as ErrorBoundary } from '@/components/errors/ErrorBoundary';
export { default as ErrorFallback } from '@/components/errors/ErrorFallback';
export { default as PageErrorBoundary } from '@/components/errors/PageErrorBoundary';
export { default as RetryableErrorBoundary, withRetryableErrorBoundary } from '@/components/errors/RetryableErrorBoundary';
export { default as ErrorState } from '@/components/ui/error-state';
export { default as InlineError } from '@/components/errors/InlineError';
export { default as CardErrorState } from '@/components/errors/CardErrorState';
export { default as PartialErrorState } from '@/components/errors/PartialErrorState';
export { 
  EmptyState,
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  FilterEmptyState,
  CardEmptyState,
  EmptyListState
} from '@/components/errors/EmptyStates';

// Export data handling components
export { DataStateHandler, PartialDataStateHandler } from '@/components/ui/data-state-handler';

// Export data fetching hooks
export { useSupabaseFetch, usePaginatedSupabaseFetch, usePartialDataFetch } from '@/hooks/useSupabaseFetch';
export { useSupabaseForm } from '@/hooks/useSupabaseForm';

// Re-export form components
export { FormSubmitButton } from '@/components/ui/form-submit-button';
export { FormErrorSummary } from '@/components/ui/form-error-summary';
export { AsyncField } from '@/components/ui/async-field';

// Re-export toast notifications for convenience
export { 
  notify,
  notifySuccess, 
  notifyError, 
  notifyWarning,
  notifyInfo,
  notifyPromise,
  notifyAndLog,
  useToast
} from '@/lib/notifications/toast';
