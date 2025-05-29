import { useCallback, useState } from "react";

/**
 * Hook for debouncing function calls
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced version of the callback function
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setTimeoutId(
        setTimeout(() => {
          callback(...args);
        }, delay),
      );
    },
    [callback, delay, timeoutId],
  );

  return debouncedCallback;
};

export default useDebouncedCallback;
