
import { useState, useCallback } from 'react';
import { handleError } from './ErrorHandler';
import type { AlloraError } from './errorTypes';

/**
 * Hook to provide error handling capabilities to components
 */
export function useErrorHandler(defaultContext: Record<string, any> = {}) {
  const [lastError, setLastError] = useState<AlloraError | null>(null);
  const [isHandlingError, setIsHandlingError] = useState(false);
  
  const handleException = useCallback(async (
    error: unknown, 
    options: Parameters<typeof handleError>[1] = {}
  ) => {
    setIsHandlingError(true);
    try {
      const alloraError = await handleError(error, {
        context: { ...defaultContext, ...options.context },
        ...options
      });
      setLastError(alloraError);
      return alloraError;
    } finally {
      setIsHandlingError(false);
    }
  }, [defaultContext]);
  
  return {
    handleError: handleException,
    lastError,
    isHandlingError,
    clearError: () => setLastError(null)
  };
}

/**
 * Higher-order function to add error handling to any function
 * @param fn Function to wrap with error handling
 * @param options Error handling options
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Parameters<typeof handleError>[1] = {}
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      await handleError(error, options);
      return null;
    }
  };
}
