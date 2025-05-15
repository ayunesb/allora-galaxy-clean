
/**
 * Error handling components for Allora OS
 * 
 * This module exports reusable error handling components
 * for consistent error presentation throughout the application.
 */

// Core error components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorFallback } from '@/components/ErrorFallback';

// Edge function error handling
export { 
  EdgeFunctionError,
  EdgeFunctionErrorDisplay,
  EdgeFunctionHandler 
} from './EdgeFunctionErrorHandler';
export { default as withEdgeFunctionErrorHandling } from './withEdgeFunctionErrorHandling';

// Specialized components for different error types
export { default as EmptyStateRenderer } from './EmptyStateRenderer';
export { default as RetryableErrorBoundary } from './RetryableErrorBoundary';
