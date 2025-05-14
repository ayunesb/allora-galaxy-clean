
/**
 * Retry utility for handling transient errors in operations
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  context?: Record<string, any>;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  module?: string;
  tenantId?: string | null;
}

/**
 * Executes a function with retry logic for resilience
 * @param fn The function to execute with retry
 * @param options Retry configuration options
 * @returns The result of the function execution
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    backoffFactor = 2,
    context = {},
    onRetry,
    module = 'unknown',
    tenantId = null
  } = options;

  let lastError: Error;
  let attempt = 0;

  while (attempt < maxRetries + 1) {
    try {
      // Attempt execution
      return await fn();
    } catch (error) {
      attempt++;
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this is the last attempt, throw the error
      if (attempt > maxRetries) {
        console.error(
          `[${module}] Operation failed after ${maxRetries + 1} attempts:`, 
          { error: lastError.message, context, tenantId }
        );
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      
      // Log the retry
      console.warn(
        `[${module}] Retrying operation (${attempt}/${maxRetries}) after error:`, 
        { error: lastError.message, delay, context, tenantId }
      );
      
      // Execute onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt, delay);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This line should never be reached due to the throw in the loop
  throw lastError!;
}

/**
 * Creates a retry-enabled version of a function
 * @param fn The function to wrap with retry logic
 * @param options Retry configuration options
 * @returns A new function with built-in retry capability
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}
