
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that delays updating a value until a specified delay has passed
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @param options Configuration options
 * @returns The debounced value and additional controls
 */
export function useDebounce<T>(
  value: T, 
  delay: number,
  options: { 
    leading?: boolean; 
    maxWait?: number;
    onComplete?: (value: T) => void;
  } = {}
) {
  const { leading = false, maxWait, onComplete } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const leadingRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef<T>(value);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
  }, []);

  // Handle debounce with leading, maxWait and cleanup
  useEffect(() => {
    valueRef.current = value;
    
    // Handle leading edge debounce
    if (leading && leadingRef.current) {
      setDebouncedValue(value);
      leadingRef.current = false;
      
      if (onComplete) {
        onComplete(value);
      }
      
      return;
    }
    
    clearTimeouts();
    
    // Setup maxWait timeout if specified
    if (maxWait) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        setDebouncedValue(valueRef.current);
        leadingRef.current = leading;
        
        if (onComplete) {
          onComplete(valueRef.current);
        }
      }, maxWait);
    }
    
    // Setup regular delay timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(valueRef.current);
      leadingRef.current = leading;
      
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = null;
      }
      
      if (onComplete) {
        onComplete(valueRef.current);
      }
    }, delay);
    
    return clearTimeouts;
  }, [value, delay, leading, maxWait, clearTimeouts, onComplete]);
  
  // Make sure timeouts are cleared when component unmounts
  useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);
  
  // Force immediate update if needed
  const flush = useCallback(() => {
    clearTimeouts();
    setDebouncedValue(valueRef.current);
    leadingRef.current = leading;
    
    if (onComplete) {
      onComplete(valueRef.current);
    }
  }, [clearTimeouts, leading, onComplete]);
  
  // Cancel debouncing
  const cancel = useCallback(() => {
    clearTimeouts();
    leadingRef.current = leading;
  }, [clearTimeouts, leading]);
  
  return { debouncedValue, flush, cancel };
}

// For backward compatibility
export default useDebounce;
