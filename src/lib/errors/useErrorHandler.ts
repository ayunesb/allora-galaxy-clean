
import { useState, useCallback } from 'react';
import { handleError } from './ErrorHandler';
import { AlloraError } from './errorTypes';

/**
 * Hook for handling errors with better TypeScript support
 */
export function useErrorHandler<T = any>(options: {
  showNotification?: boolean;
  logToSystem?: boolean;
  module?: string;
  tenantId?: string;
  silent?: boolean;
  defaultError?: T | null;
} = {}) {
  const [error, setError] = useState<T | null>(options.defaultError || null);
  const [isHandlingError, setIsHandlingError] = useState(false);
  
  const handleErrorWithState = useCallback(async (
    err: unknown, 
    context: Record<string, any> = {}
  ): Promise<AlloraError> => {
    setIsHandlingError(true);
    
    try {
      // Use the central error handler
      const alloraError = await handleError(err, {
        ...options,
        context,
      });
      
      // Update the component error state
      setError(err as T);
      
      return alloraError;
    } finally {
      setIsHandlingError(false);
    }
  }, [options]);
  
  const clearError = useCallback(() => setError(null), []);
  
  return {
    error,
    setError,
    clearError,
    isHandlingError,
    handleError: handleErrorWithState
  };
}

/**
 * HOC to wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    showNotification?: boolean;
    logToSystem?: boolean;
    module?: string;
    tenantId?: string;
    silent?: boolean;
    context?: Record<string, any>;
    onError?: (error: AlloraError) => void;
  } = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const alloraError = await handleError(error, {
        ...options,
        context: {
          ...options.context,
          functionName: fn.name,
          functionArgs: args
        }
      });
      
      if (options.onError) {
        options.onError(alloraError);
      }
      
      throw alloraError;
    }
  };
}
