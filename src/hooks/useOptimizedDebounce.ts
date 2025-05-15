
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that provides optimized debounced state management
 * 
 * @param initialValue The initial value
 * @param delay The debounce delay in milliseconds
 * @returns Object with value, debouncedValue, and setSearchValue function
 */
export function useOptimizedDebounce<T>(initialValue: T, delay: number) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update the debouncedValue after delay
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Set value function that avoids recreating on each render
  const setSearchValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return {
    value,
    debouncedValue,
    setSearchValue,
  };
}

export default useOptimizedDebounce;
