
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
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
  };
}

// Circuit breaker state tracking
const circuitState: Record<string, {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  resetTimeout?: NodeJS.Timeout;
}> = {};

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
    circuitBreaker = { failureThreshold: 5, resetTimeout: 30000 },
  } = options;
  
  const retryableErrors = options.retryableErrors || ((error: Error) => {
    // Default retryable errors
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      (error instanceof AlloraError && error.retry === true)
    );
  });
  
  // Generate a circuit key based on function and context
  const circuitKey = `${module}:${Object.keys(context).sort().join(',')}`;
  
  // Initialize circuit state if needed
  if (!circuitState[circuitKey]) {
    circuitState[circuitKey] = {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    };
  }
  
  // Check if circuit is open (failing)
  if (circuitState[circuitKey].isOpen) {
    const timeSinceLastFailure = Date.now() - circuitState[circuitKey].lastFailure;
    
    if (timeSinceLastFailure < circuitBreaker.resetTimeout!) {
      console.warn(`Circuit breaker open for ${circuitKey}, skipping operation`);
      throw new AlloraError({
        message: 'Operation temporarily disabled due to multiple failures',
        code: 'CIRCUIT_OPEN',
        context: { 
          circuitKey,
          failures: circuitState[circuitKey].failures,
          lastFailure: new Date(circuitState[circuitKey].lastFailure).toISOString(),
          remainingTime: circuitBreaker.resetTimeout! - timeSinceLastFailure
        },
        severity: 'medium',
        userMessage: 'This operation is temporarily unavailable due to technical issues. Please try again later.',
      });
    } else {
      // Reset circuit for retry
      console.info(`Circuit breaker reset for ${circuitKey}, allowing retry`);
      circuitState[circuitKey].isOpen = false;
    }
  }
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the function
      const result = await fn();
      
      // Success - reset circuit state
      if (circuitState[circuitKey].failures > 0) {
        circuitState[circuitKey].failures = 0;
        circuitState[circuitKey].isOpen = false;
        if (circuitState[circuitKey].resetTimeout) {
          clearTimeout(circuitState[circuitKey].resetTimeout);
        }
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Update circuit breaker state
      circuitState[circuitKey].failures++;
      circuitState[circuitKey].lastFailure = Date.now();
      
      // Check if we should open the circuit
      if (circuitState[circuitKey].failures >= circuitBreaker.failureThreshold!) {
        circuitState[circuitKey].isOpen = true;
        
        // Set timeout to close the circuit after resetTimeout
        if (circuitState[circuitKey].resetTimeout) {
          clearTimeout(circuitState[circuitKey].resetTimeout);
        }
        
        circuitState[circuitKey].resetTimeout = setTimeout(() => {
          console.info(`Circuit breaker timeout complete for ${circuitKey}, allowing retry`);
          circuitState[circuitKey].isOpen = false;
          circuitState[circuitKey].failures = 0;
        }, circuitBreaker.resetTimeout!);
      }
      
      // Check if we've reached the maximum number of retries
      if (attempt >= maxRetries) {
        // Log the final error through our system
        await handleError(error, {
          context: {
            ...context,
            attemptsMade: attempt,
            maxRetries,
            finalFailure: true,
            circuitBreakerState: circuitState[circuitKey]
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
      const baseDelay = initialDelay * Math.pow(backoffFactor, attempt);
      // Add jitter (±20%) to prevent coordinated retry storms
      const jitter = baseDelay * (0.8 + Math.random() * 0.4); 
      const delay = Math.min(jitter, maxDelay);
      
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
 * Wraps a function to automatically retry on failures with detailed statistics
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  // Store statistics for this function
  const stats = {
    calls: 0,
    successes: 0,
    failures: 0,
    retries: 0,
    totalTime: 0
  };
  
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = performance.now();
    stats.calls++;
    
    try {
      let retryCount = 0;
      
      const result = await withRetry(
        () => fn(...args),
        {
          ...options,
          onRetry: (error, attempt) => {
            retryCount = attempt;
            stats.retries++;
            if (options.onRetry) {
              options.onRetry(error, attempt, options.initialDelay || 300);
            }
          },
          context: {
            ...(options.context || {}),
            functionName: fn.name,
            args: args.map(arg => {
              // Safely stringify args for context, but avoid huge objects
              try {
                return typeof arg === 'object' 
                  ? `[${typeof arg}: ${Object.keys(arg || {}).join(',')}]` 
                  : String(arg).substring(0, 100);
              } catch {
                return `[${typeof arg}]`;
              }
            }),
            stats
          }
        }
      );
      
      // Record success
      stats.successes++;
      stats.totalTime += (performance.now() - startTime);
      
      return result;
    } catch (error) {
      // Record failure
      stats.failures++;
      stats.totalTime += (performance.now() - startTime);
      throw error;
    }
  };
}

/**
 * Get statistics for all circuit breakers
 */
export function getCircuitBreakerStatus(): Record<string, {
  isOpen: boolean,
  failures: number,
  lastFailure: string | null,
  remainingCooldown: number | null
}> {
  const now = Date.now();
  return Object.entries(circuitState).reduce((acc, [key, state]) => {
    acc[key] = {
      isOpen: state.isOpen,
      failures: state.failures,
      lastFailure: state.lastFailure ? new Date(state.lastFailure).toISOString() : null,
      remainingCooldown: state.isOpen ? 
        state.lastFailure + 30000 - now : null // Using default 30s if not specified
    };
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Reset a specific circuit breaker
 */
export function resetCircuitBreaker(circuitKey: string): boolean {
  if (circuitState[circuitKey]) {
    circuitState[circuitKey].isOpen = false;
    circuitState[circuitKey].failures = 0;
    if (circuitState[circuitKey].resetTimeout) {
      clearTimeout(circuitState[circuitKey].resetTimeout);
      circuitState[circuitKey].resetTimeout = undefined;
    }
    return true;
  }
  return false;
}
