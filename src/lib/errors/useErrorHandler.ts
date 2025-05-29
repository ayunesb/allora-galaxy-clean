import { useState, useCallback } from "react";
import { handleError } from "./ErrorHandler";
import type { AlloraError } from "./errorTypes";

/**
 * Hook to provide error handling capabilities to components
 */
export function useErrorHandler<T = unknown>(
  handler: (error: T, context?: Record<string, unknown>) => void
) {
  const [lastError, setLastError] = useState<AlloraError | null>(null);
  const [isHandlingError, setIsHandlingError] = useState(false);

  const handleException = useCallback(
    async (error: unknown) => {
      setIsHandlingError(true);
      try {
        const alloraError = await handleError(error);
        setLastError(alloraError);
        return alloraError;
      } finally {
        setIsHandlingError(false);
      }
    },
    [],
  );

  return {
    handleError: handleException,
    lastError,
    isHandlingError,
    clearError: () => setLastError(null),
  };
}
