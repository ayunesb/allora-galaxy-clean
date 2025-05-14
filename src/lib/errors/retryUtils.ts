
import { NetworkError, TimeoutError, AlloraError } from './errorTypes';
import { handleError } from './ErrorHandler';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  context?: Record<string, any>;
  tenantId?: string;
  module?: string;
}

/**
 * Utility for retrying asynchronous functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 10000,
    backoffFactor = 2,
    tenantId = 'system',
    module = 'system',
    context = {},
    onRetry = () => {},
  } = options;
  
  const retryableErrors = options.retryableErrors || ((error: Error) => {
    // Default retryable errors
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      (error instanceof AlloraError && error.retry === true)
    );
  });
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if we've reached the maximum number of retries
      if (attempt >= maxRetries) {
        // Log the final error through our system
        await handleError(error, {
          context: {
            ...context,
            attemptsMade: attempt,
            maxRetries,
            finalFailure: true,
          },
          tenantId,
          module,
        });
        
        throw error;
      }
      
      // Check if the error is retryable
      if (!retryableErrors(error)) {
        await handleError(error, {
          context: {
            ...context,
            attemptsMade: attempt,
            maxRetries,
            notRetryable: true,
          },
          tenantId,
          module,
        });
        
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt) * (0.8 + Math.random() * 0.4),
        maxDelay
      );
      
      // Log retry
      console.info(`Retrying after error (attempt ${attempt + 1}/${maxRetries}), delay: ${delay}ms`);
      
      // Call onRetry callback
      onRetry(error, attempt + 1, delay);
      
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen but TypeScript needs it
  throw lastError!;
}

/**
 * Wraps a function to automatically retry on failures
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  };
}
