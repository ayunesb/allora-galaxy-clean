
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
}

// Store circuit breakers in memory (would need persistent storage in a real app)
const circuitBreakers: Record<string, {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  options: CircuitBreakerOptions;
}> = {};

/**
 * Get the current state of a circuit breaker
 */
export function getCircuitBreakerStatus(circuitId: string): CircuitState {
  if (!circuitBreakers[circuitId]) {
    return 'CLOSED'; // Default state
  }

  const circuit = circuitBreakers[circuitId];
  
  // Check if we should attempt to reset from OPEN to HALF_OPEN
  if (circuit.state === 'OPEN') {
    const now = Date.now();
    if (now - circuit.lastFailure > circuit.options.resetTimeout) {
      circuit.state = 'HALF_OPEN';
    }
  }
  
  return circuit.state;
}

/**
 * Reset a circuit breaker to CLOSED state
 */
export function resetCircuitBreaker(circuitId: string): void {
  if (circuitBreakers[circuitId]) {
    circuitBreakers[circuitId].state = 'CLOSED';
    circuitBreakers[circuitId].failures = 0;
  }
}

/**
 * Record a failure on a circuit and potentially open it
 */
function recordFailure(circuitId: string): void {
  if (!circuitBreakers[circuitId]) {
    return;
  }
  
  const circuit = circuitBreakers[circuitId];
  circuit.failures++;
  circuit.lastFailure = Date.now();
  
  if (circuit.failures >= circuit.options.failureThreshold) {
    circuit.state = 'OPEN';
  }
}

/**
 * Record a success on a circuit and close it if it was half-open
 */
function recordSuccess(circuitId: string): void {
  if (!circuitBreakers[circuitId]) {
    return;
  }
  
  const circuit = circuitBreakers[circuitId];
  if (circuit.state === 'HALF_OPEN') {
    circuit.state = 'CLOSED';
    circuit.failures = 0;
  }
}

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  exponential?: boolean;
  jitter?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
  circuitId?: string;
  circuitOptions?: CircuitBreakerOptions;
}

/**
 * Wrapper function that provides retry capability
 * @param fn The function to retry
 * @param options Retry options
 * @returns The result of the function if successful
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 300,
    exponential = true,
    jitter = true,
    onRetry,
    circuitId,
    circuitOptions = { failureThreshold: 5, resetTimeout: 30000 }
  } = options;
  
  // Initialize circuit breaker if provided and not already initialized
  if (circuitId && !circuitBreakers[circuitId]) {
    circuitBreakers[circuitId] = {
      state: 'CLOSED',
      failures: 0,
      lastFailure: 0,
      options: circuitOptions
    };
  }
  
  let attempt = 0;
  
  // Check circuit breaker if provided
  if (circuitId && getCircuitBreakerStatus(circuitId) === 'OPEN') {
    throw new Error(`Circuit ${circuitId} is open`);
  }
  
  while (true) {
    try {
      const result = await fn();
      
      // Record success if using circuit breaker
      if (circuitId) {
        recordSuccess(circuitId);
      }
      
      return result;
    } catch (error: any) {
      attempt++;
      
      // Record failure if using circuit breaker
      if (circuitId) {
        recordFailure(circuitId);
        
        // If circuit is now open, stop retrying
        if (getCircuitBreakerStatus(circuitId) === 'OPEN') {
          throw error;
        }
      }
      
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      let delay = baseDelay;
      if (exponential) {
        delay = baseDelay * Math.pow(2, attempt - 1);
      }
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      // Call onRetry callback if provided
      if (onRetry && error instanceof Error) {
        onRetry(error, attempt);
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Creates a retryable version of a function
 * @param fn The function to make retryable
 * @param options Retry options
 * @returns A wrapped function with retry capability
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => ReturnType<T> {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options) as ReturnType<T>;
  });
}

/**
 * React hook to handle retries with UI feedback
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions & {
    showFeedback?: boolean;
    feedbackMessage?: string;
  } = {}
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const {
    showFeedback = true,
    feedbackMessage = "Operation failed, retrying...",
    ...retryOptions
  } = options;
  
  const execute = async () => {
    setIsRetrying(true);
    setError(null);
    setRetryCount(0);
    
    try {
      const result = await withRetry(
        fn,
        {
          ...retryOptions,
          onRetry: (err, attempt) => {
            setRetryCount(attempt);
            if (showFeedback) {
              toast.info(`${feedbackMessage} (${attempt}/${retryOptions.maxAttempts || 3})`);
            }
            if (retryOptions.onRetry) {
              retryOptions.onRetry(err, attempt);
            }
          }
        }
      );
      
      setData(result);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsRetrying(false);
    }
  };
  
  return {
    execute,
    isRetrying,
    retryCount,
    error,
    data,
    reset: () => {
      setIsRetrying(false);
      setRetryCount(0);
      setError(null);
      setData(null);
    }
  };
}
