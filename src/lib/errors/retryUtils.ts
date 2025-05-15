
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, delay: number) => void;
  retryCondition?: (error: Error) => boolean;
}

// Circuit breaker state
const circuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  status: 'closed' as 'closed' | 'open' | 'half-open',
  resetTimeout: 60000, // 1 minute
};

/**
 * Function to retry an operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    onRetry,
    retryCondition = () => true
  } = options;

  let attempt = 0;
  let lastError: Error;

  while (attempt <= maxRetries) {
    try {
      // Check circuit breaker
      if (circuitBreakerState.status === 'open') {
        const timeSinceLastFailure = Date.now() - circuitBreakerState.lastFailure;
        if (timeSinceLastFailure < circuitBreakerState.resetTimeout) {
          throw new Error('Circuit breaker is open');
        }
        circuitBreakerState.status = 'half-open';
      }
      
      if (attempt > 0 && onRetry) {
        const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
        onRetry(attempt, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await operation();
      
      // Reset circuit breaker on success
      if (circuitBreakerState.status === 'half-open') {
        circuitBreakerState.status = 'closed';
        circuitBreakerState.failures = 0;
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Update circuit breaker
      if (circuitBreakerState.status === 'half-open') {
        circuitBreakerState.status = 'open';
        circuitBreakerState.lastFailure = Date.now();
      } else if (circuitBreakerState.status === 'closed') {
        circuitBreakerState.failures++;
        if (circuitBreakerState.failures >= 5) { // Trip after 5 consecutive failures
          circuitBreakerState.status = 'open';
          circuitBreakerState.lastFailure = Date.now();
        }
      }
      
      if (!retryCondition(error)) {
        throw error;
      }
      
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }
    }
  }

  throw lastError!;
}

/**
 * Create a function with built-in retry capability
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  };
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus() {
  return {
    status: circuitBreakerState.status,
    failures: circuitBreakerState.failures,
    lastFailure: circuitBreakerState.lastFailure,
    timeSinceLastFailure: Date.now() - circuitBreakerState.lastFailure,
    resetTimeRemaining: Math.max(
      0,
      circuitBreakerState.resetTimeout - (Date.now() - circuitBreakerState.lastFailure)
    )
  };
}

/**
 * Reset circuit breaker
 */
export function resetCircuitBreaker() {
  circuitBreakerState.status = 'closed';
  circuitBreakerState.failures = 0;
  circuitBreakerState.lastFailure = 0;
  return getCircuitBreakerStatus();
}

/**
 * Hook for retry operations in components
 */
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    setIsRetrying(true);
    try {
      const result = await withRetry(operation, {
        ...options,
        onRetry: (attempt) => {
          setRetryCount(attempt);
          if (options.onRetry) {
            options.onRetry(attempt, 0);
          }
        }
      });
      return result;
    } finally {
      setIsRetrying(false);
    }
  }, []);
  
  return {
    retry,
    retryCount,
    isRetrying,
    resetRetry: () => setRetryCount(0)
  };
}
