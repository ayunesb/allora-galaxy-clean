
/**
 * Utility functions for retry mechanisms
 */

/**
 * Options for the retry function
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise with the result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    onRetry
  } = options;
  
  let attempt = 0;
  let lastError: any;
  
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      lastError = error;
      
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      if (onRetry) {
        onRetry(error, attempt);
      }
      
      // Calculate exponential backoff with jitter
      const delayMs = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      );
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  // Should never reach here due to throw above
  throw lastError;
}

/**
 * Retry utilities
 */
export const retryUtils = {
  retry,
  
  /**
   * Default retry conditions for common scenarios
   */
  conditions: {
    /**
     * Retry on network errors only
     */
    networkErrorsOnly: (error: any) => {
      const networkErrors = [
        'NetworkError',
        'Failed to fetch',
        'Network request failed',
        'network error'
      ];
      
      const errorString = String(error).toLowerCase();
      return networkErrors.some(msg => errorString.includes(msg.toLowerCase()));
    },
    
    /**
     * Retry on 5xx server errors
     */
    serverErrors: (error: any) => {
      const status = error?.status || error?.statusCode;
      return status && status >= 500 && status < 600;
    },
    
    /**
     * Retry on both network and server errors
     */
    networkAndServerErrors: (error: any) => {
      return (
        retryUtils.conditions.networkErrorsOnly(error) ||
        retryUtils.conditions.serverErrors(error)
      );
    }
  }
};
