
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  processEdgeResponse, 
  handleEdgeError, 
  createEdgeFunction 
} from '@/lib/errors/clientErrorHandler';
import { toast } from 'sonner';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Client Error Handler', () => {
  describe('processEdgeResponse', () => {
    it('should extract data from successful response', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          data: { result: 'test-data' },
          requestId: 'req_123',
          timestamp: new Date().toISOString()
        })
      };

      const result = await processEdgeResponse(mockResponse as Response);
      expect(result).toEqual({ result: 'test-data' });
    });

    it('should throw error for unsuccessful response', async () => {
      // Mock error response
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { field: 'Missing required field' },
          status: 400,
          requestId: 'req_456',
          timestamp: new Date().toISOString()
        })
      };

      await expect(processEdgeResponse(mockResponse as unknown as Response))
        .rejects.toThrow('Validation failed');
    });

    it('should handle JSON parsing errors in error responses', async () => {
      // Mock response with JSON parsing error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      };

      await expect(processEdgeResponse(mockResponse as unknown as Response))
        .rejects.toThrow('Server Error: 500 Internal Server Error');
    });

    it('should handle non-standard response formats', async () => {
      // Mock non-standard successful response (no success flag)
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          result: 'legacy-format'
        })
      };

      const result = await processEdgeResponse(mockResponse as Response);
      expect(result).toEqual({ result: 'legacy-format' });
    });
  });

  describe('handleEdgeError', () => {
    it('should display toast error message', () => {
      const error = new Error('Test error');
      Object.assign(error, { requestId: 'req_789' });

      handleEdgeError(error);
      
      expect(toast.error).toHaveBeenCalledWith('Test error', expect.anything());
      expect(console.error).toHaveBeenCalled();
    });

    it('should use fallback message when error has no message', () => {
      const error = {};
      
      handleEdgeError(error, { 
        fallbackMessage: 'Default error message'
      });
      
      expect(toast.error).toHaveBeenCalledWith(
        'Default error message', 
        expect.anything()
      );
    });

    it('should not show toast when showToast is false', () => {
      const error = new Error('Silent error');
      
      handleEdgeError(error, { showToast: false });
      
      expect(toast.error).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should not log to console when logToConsole is false', () => {
      const error = new Error('No console error');
      
      handleEdgeError(error, { logToConsole: false });
      
      expect(console.error).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should call errorCallback when provided', () => {
      const error = new Error('Callback error');
      const mockCallback = vi.fn();
      
      handleEdgeError(error, { errorCallback: mockCallback });
      
      expect(mockCallback).toHaveBeenCalledWith(error);
    });
  });

  describe('createEdgeFunction', () => {
    it('should return result when function succeeds', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = createEdgeFunction(mockFn);
      
      const result = await wrappedFn('arg1');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    it('should handle errors and return null when function fails', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Function failed'));
      const wrappedFn = createEdgeFunction(mockFn);
      
      const result = await wrappedFn('arg1');
      
      expect(result).toBeNull();
      expect(mockFn).toHaveBeenCalledWith('arg1');
      expect(toast.error).toHaveBeenCalled();
    });

    it('should use custom error message when provided', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Function failed'));
      const wrappedFn = createEdgeFunction(mockFn, {
        fallbackMessage: 'Custom error message'
      });
      
      await wrappedFn('arg1');
      
      expect(toast.error).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          description: expect.anything()
        })
      );
    });
  });
});
