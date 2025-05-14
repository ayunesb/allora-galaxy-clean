
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure: number | null;
  nextAttempt: number | null;
}

// Global circuit breaker states for different operations
const circuitBreakers: Record<string, CircuitBreakerState> = {};

/**
 * Get the current status of a circuit breaker
 */
export function getCircuitBreakerStatus(key: string): CircuitBreakerState['status'] {
  return (circuitBreakers[key]?.status || 'closed');
}

/**
 * Reset a circuit breaker to its closed state
 */
export function resetCircuitBreaker(key: string): void {
  circuitBreakers[key] = {
    status: 'closed',
    failures: 0,
    lastFailure: null,
    nextAttempt: null
  };
}

/**
 * Calculate backoff delay with optional jitter
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number, jitter: boolean): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  if (!jitter) return exponentialDelay;
  
  // Add randomness to avoid thundering herd problem
  return exponentialDelay * (0.5 + Math.random() * 0.5);
}

/**
 * Generic retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    jitter = true,
    onRetry
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (attempt >= maxAttempts) {
        // Exhausted all retry attempts
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = calculateBackoff(attempt, baseDelay, maxDelay, jitter);
      
      // Notify about retry if callback provided
      if (onRetry) {
        onRetry(error, attempt);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Creates a retryable version of a function
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions & { circuitBreakerKey?: string } = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const {
      circuitBreakerKey,
      maxAttempts = 3,
      ...restOptions
    } = options;

    // If circuit breaker is defined and in open state, fail fast
    if (circuitBreakerKey && 
        circuitBreakers[circuitBreakerKey]?.status === 'open' &&
        circuitBreakers[circuitBreakerKey].nextAttempt &&
        circuitBreakers[circuitBreakerKey].nextAttempt > Date.now()) {
      throw new Error(`Circuit breaker is open for ${circuitBreakerKey}`);
    }

    try {
      // Attempt the operation with retries
      const result = await retry(() => fn(...args), { maxAttempts, ...restOptions });
      
      // If successful and circuit breaker exists, reset it
      if (circuitBreakerKey && circuitBreakers[circuitBreakerKey]) {
        resetCircuitBreaker(circuitBreakerKey);
      }
      
      return result;
    } catch (err) {
      // If circuit breaker is enabled, update its state
      if (circuitBreakerKey) {
        const breaker = circuitBreakers[circuitBreakerKey] || {
          status: 'closed',
          failures: 0,
          lastFailure: null,
          nextAttempt: null
        };
        
        breaker.failures += 1;
        breaker.lastFailure = Date.now();
        
        // Open the circuit after consecutive failures
        if (breaker.failures >= (maxAttempts * 2)) {
          breaker.status = 'open';
          // Set cool-off period (30 seconds)
          breaker.nextAttempt = Date.now() + 30000;
        }
        
        circuitBreakers[circuitBreakerKey] = breaker;
      }
      
      throw err;
    }
  }) as T;
}

/**
 * Hook for using retry functionality in React components
 */
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retryAsync = useCallback(async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    setIsRetrying(true);
    setRetryCount(0);
    
    try {
      return await retry(fn, {
        ...options,
        onRetry: (error, attempt) => {
          setRetryCount(attempt);
          if (options.onRetry) {
            options.onRetry(error, attempt);
          }
        }
      });
    } finally {
      setIsRetrying(false);
    }
  }, []);
  
  return {
    retryAsync,
    retryCount,
    isRetrying
  };
}
