
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, createRetryableFunction } from '@/lib/errors/retryUtils';

describe('Retry utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('withRetry', () => {
    it('should return the result if the function succeeds on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry the specified number of times before failing', async () => {
      const error = new Error('test error');
      const fn = vi.fn().mockRejectedValue(error);
      
      const retryPromise = withRetry(fn, { maxRetries: 2 });
      
      // Fast-forward timers to trigger retries
      await vi.runAllTimersAsync();
      
      await expect(retryPromise).rejects.toThrow(error);
      expect(fn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should succeed if a retry succeeds', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');
      
      const retryPromise = withRetry(fn, { maxRetries: 2 });
      
      // Fast-forward timers to trigger retries
      await vi.runAllTimersAsync();
      
      const result = await retryPromise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should use exponential backoff for retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('test error'));
      
      // Initial delay: 100ms, backoff factor: 3
      const retryPromise = withRetry(fn, { 
        maxRetries: 2, 
        initialDelay: 100, 
        backoffFactor: 3 
      });
      
      // Fast-forward past the first delay (100ms)
      await vi.advanceTimersByTimeAsync(100);
      expect(fn).toHaveBeenCalledTimes(2); // Initial call + first retry
      
      // Fast-forward past the second delay (300ms)
      await vi.advanceTimersByTimeAsync(300);
      expect(fn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
      
      await expect(retryPromise).rejects.toThrow();
    });

    it('should call onRetry callback if provided', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockResolvedValueOnce('success');
      
      const retryPromise = withRetry(fn, { 
        maxRetries: 1, 
        initialDelay: 100,
        onRetry
      });
      
      await vi.advanceTimersByTimeAsync(100);
      await retryPromise;
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error), 
        1, // attempt number
        100 // delay
      );
    });
  });

  describe('createRetryableFunction', () => {
    it('should create a function that uses retry logic', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockResolvedValueOnce('success');
      
      const retryableFn = createRetryableFunction(fn, { maxRetries: 1, initialDelay: 100 });
      
      const resultPromise = retryableFn('arg1', 'arg2');
      await vi.advanceTimersByTimeAsync(100);
      const result = await resultPromise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});
