/**
 * Error handling system for Allora OS
 */

// Export error types
export * from "./errorTypes";

// Export error handlers
export {
  ErrorHandler,
  handleError,
  handleSupabaseError,
  handleEdgeFunctionError,
} from "./ErrorHandler";
export { ErrorHandlerBase } from "./ErrorHandlerBase";
export { SupabaseErrorHandler } from "./SupabaseErrorHandler";
export { EdgeFunctionErrorHandler } from "./EdgeFunctionErrorHandler";

// Export hooks
export { useErrorHandler, withErrorHandling } from "./useErrorHandler";
export { useDataFetching, useStableFetching } from "./useDataFetching";

// Export utilities
export {
  withRetry,
  createRetryableFunction,
  getCircuitBreakerStatus,
  resetCircuitBreaker,
  useRetry,
} from "./retryUtils";

// Export components
export { default as ErrorBoundary } from "@/components/errors/ErrorBoundary";
export { default as ErrorFallback } from "@/components/errors/ErrorFallback";
export { default as PageErrorBoundary } from "@/components/errors/PageErrorBoundary";
export {
  default as RetryableErrorBoundary,
  withRetryableErrorBoundary,
} from "@/components/errors/RetryableErrorBoundary";
export { default as ErrorState } from "@/components/ui/error-state";
export { default as InlineError } from "@/components/errors/InlineError";
export { default as CardErrorState } from "@/components/errors/CardErrorState";
export { default as PartialErrorState } from "@/components/errors/PartialErrorState";
export {
  EmptyState,
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  FilterEmptyState,
  CardEmptyState,
  EmptyListState,
} from "@/components/errors/EmptyStates";

// Export data handling components
export {
  DataStateHandler,
  PartialDataStateHandler,
} from "@/components/ui/data-state-handler";

// Export client error handler
export {
  processEdgeResponse,
  handleEdgeError,
  createEdgeFunction,
} from "./clientErrorHandler";

// Export notification helpers
export {
  useToast,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyPromise,
  notifyAndLog,
} from "@/lib/notifications/toast";

// Export EdgeFunction error components
export {
  EdgeFunctionError,
  EdgeFunctionErrorDisplay,
  EdgeFunctionHandler,
} from "@/components/errors/EdgeFunctionErrorHandler";
import withEdgeFunctionErrorHandling from "@/components/errors/withEdgeFunctionErrorHandling";
export { withEdgeFunctionErrorHandling };
