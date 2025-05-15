
import { AlloraError } from '@/lib/errors/errorTypes';
import { logSystemEvent, logSystemError } from '@/lib/system/logSystemEvent';

interface ErrorReportOptions {
  /** The module or component where the error occurred */
  module?: string;
  /** Additional context information */
  context?: Record<string, any>;
  /** User ID if applicable */
  userId?: string;
  /** Tenant ID */
  tenantId?: string;
  /** Whether to send to external monitoring service */
  reportToExternal?: boolean;
  /** Custom error code */
  code?: string;
  /** Stack trace if available */
  stack?: string;
}

/**
 * Reports an error to the centralized error monitoring system
 * 
 * @param error The error that occurred
 * @param options Configuration options for error reporting
 * @returns Promise resolving to a report ID
 */
export async function reportError(
  error: Error | AlloraError | string,
  options: ErrorReportOptions = {}
): Promise<string> {
  const {
    module = 'application',
    context = {},
    userId,
    tenantId = 'system',
    reportToExternal = true,
    code,
    stack
  } = options;
  
  // Create a standardized error object
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message;
  
  const errorStack = typeof error === 'string' 
    ? stack 
    : error.stack || stack;
  
  const errorCode = error instanceof AlloraError 
    ? error.code 
    : code;
  
  const errorContext = error instanceof AlloraError
    ? { ...error.context, ...context }
    : context;

  // Log to system event logs
  const { id } = await logSystemError(
    module,
    typeof error === 'string' ? new Error(error) : error,
    {
      ...errorContext,
      user_id: userId,
      code: errorCode,
      reported_at: new Date().toISOString()
    },
    tenantId
  );
  
  // Send to external monitoring system if enabled
  if (reportToExternal) {
    try {
      await sendToExternalMonitoring({
        message: errorMessage,
        stack: errorStack,
        code: errorCode,
        context: errorContext,
        userId,
        tenantId,
        module,
        timestamp: new Date().toISOString(),
        reportId: id
      });
    } catch (reportingError) {
      // Don't let reporting errors cascade
      console.error('Failed to send error to external monitoring:', reportingError);
    }
  }
  
  return id || 'unknown';
}

/**
 * Send error data to an external monitoring service
 * This would be implemented to connect to a service like Sentry, LogRocket, etc.
 */
async function sendToExternalMonitoring(data: Record<string, any>): Promise<void> {
  // This is a placeholder for connecting to an external service
  // In a real implementation, this would send to Sentry, LogRocket, etc.
  
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Error telemetry data:');
    console.log(data);
    console.groupEnd();
  }
  
  // In production, you would implement actual service calls:
  // Example for Sentry:
  // Sentry.captureException(error, {
  //   extra: data
  // });
}

/**
 * React error boundary error handler that reports errors to monitoring
 */
export function reportErrorFromErrorBoundary(
  error: Error,
  errorInfo?: { componentStack?: string },
  options: ErrorReportOptions = {}
): Promise<string> {
  return reportError(error, {
    module: 'ui',
    context: {
      componentStack: errorInfo?.componentStack,
      reactErrorBoundary: true,
      ...options.context
    },
    ...options
  });
}

/**
 * Performance capture for failed operations
 */
export function reportOperationError(
  operation: string,
  error: Error | string,
  duration: number,
  options: ErrorReportOptions = {}
): Promise<string> {
  return reportError(error, {
    module: options.module || 'operations',
    context: {
      operation,
      duration_ms: duration,
      failed: true,
      ...options.context
    },
    ...options
  });
}

/**
 * Report API or edge function errors
 */
export function reportApiError(
  endpoint: string,
  error: Error | string,
  requestData?: Record<string, any>,
  options: ErrorReportOptions = {}
): Promise<string> {
  return reportError(error, {
    module: 'api',
    context: {
      endpoint,
      requestData,
      ...options.context
    },
    ...options
  });
}

/**
 * Hook for components to use error reporting
 */
export function useErrorReporting() {
  return {
    reportError,
    reportApiError,
    reportOperationError
  };
}
