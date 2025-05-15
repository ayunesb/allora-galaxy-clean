
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyPromise,
  notifyAndLog
} from '@/lib/notifications/toast';
import { toast as sonnerToast } from 'sonner';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    promise: vi.fn(),
    default: vi.fn()
  }
}));

// Mock logSystemEvent
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true })
}));

describe('Toast Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('notify function', () => {
    it('should call toast with string message', () => {
      notify('Test message');
      
      // In this case, it should fall back to default toast
      expect(sonnerToast.default).toHaveBeenCalledWith('Test message', expect.any(Object));
    });
    
    it('should call toast with object message', () => {
      notify({ title: 'Test title', description: 'Test description' });
      
      expect(sonnerToast.default).toHaveBeenCalledWith('Test title', 
        expect.objectContaining({ description: 'Test description' }));
    });
    
    it('should call specific toast type based on type param', () => {
      notify('Success message', { type: 'success' });
      expect(sonnerToast.success).toHaveBeenCalled();
      
      notify('Error message', { type: 'error' });
      expect(sonnerToast.error).toHaveBeenCalled();
      
      notify('Warning message', { type: 'warning' });
      expect(sonnerToast.warning).toHaveBeenCalled();
      
      notify('Info message', { type: 'info' });
      expect(sonnerToast.info).toHaveBeenCalled();
    });
    
    it('should pass through toast options', () => {
      notify('Test message', {
        duration: 5000,
        position: 'top-center',
        action: { label: 'Action', onClick: () => {} },
        cancel: { label: 'Cancel' }
      });
      
      expect(sonnerToast.default).toHaveBeenCalledWith('Test message', 
        expect.objectContaining({
          duration: 5000,
          position: 'top-center',
          action: expect.any(Object),
          cancel: expect.any(Object)
        }));
    });
  });
  
  describe('helper functions', () => {
    it('should call correct toast type for helper functions', () => {
      notifySuccess('Success');
      expect(sonnerToast.success).toHaveBeenCalledWith('Success', expect.any(Object));
      
      notifyError('Error');
      expect(sonnerToast.error).toHaveBeenCalledWith('Error', expect.any(Object));
      
      notifyWarning('Warning');
      expect(sonnerToast.warning).toHaveBeenCalledWith('Warning', expect.any(Object));
      
      notifyInfo('Info');
      expect(sonnerToast.info).toHaveBeenCalledWith('Info', expect.any(Object));
    });
    
    it('should handle object messages in helper functions', () => {
      notifySuccess({ title: 'Success Title', description: 'Success description' });
      expect(sonnerToast.success).toHaveBeenCalledWith('Success Title', 
        expect.objectContaining({ description: 'Success description' }));
    });
  });
  
  describe('notifyPromise', () => {
    it('should call toast.promise with correct parameters', async () => {
      const promise = Promise.resolve('result');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!'
      };
      
      notifyPromise(promise, messages);
      
      expect(sonnerToast.promise).toHaveBeenCalledWith(
        promise,
        expect.objectContaining(messages)
      );
    });
    
    it('should handle dynamic success and error messages', async () => {
      const promise = Promise.resolve('data');
      const messages = {
        loading: 'Loading...',
        success: (data: string) => `Success with ${data}!`,
        error: (err: Error) => `Error: ${err.message}`
      };
      
      notifyPromise(promise, messages);
      
      expect(sonnerToast.promise).toHaveBeenCalledWith(
        promise,
        expect.objectContaining({
          loading: 'Loading...',
          success: expect.any(Function),
          error: expect.any(Function)
        })
      );
    });
  });
  
  describe('notifyAndLog', () => {
    it('should show toast and log to system', async () => {
      await notifyAndLog('api', 'error', 'API Error', 'Failed to fetch data');
      
      expect(sonnerToast.error).toHaveBeenCalledWith('API Error', 
        expect.objectContaining({ description: 'Failed to fetch data' }));
      expect(logSystemEvent).toHaveBeenCalledWith(
        'api',
        'error',
        expect.objectContaining({
          description: 'Failed to fetch data',
          toast_type: 'error'
        }),
        'system'
      );
    });
    
    it('should use appropriate toast type based on error level', async () => {
      await notifyAndLog('system', 'info', 'System Info');
      expect(sonnerToast.info).toHaveBeenCalled();
      
      await notifyAndLog('system', 'warning', 'System Warning');
      expect(sonnerToast.warning).toHaveBeenCalled();
    });
    
    it('should allow override of toast type', async () => {
      await notifyAndLog('api', 'error', 'API Warning', 'Minor issue', 'warning');
      
      expect(sonnerToast.warning).toHaveBeenCalledWith('API Warning', 
        expect.objectContaining({ description: 'Minor issue' }));
      expect(logSystemEvent).toHaveBeenCalledWith(
        'api',
        'error',
        expect.objectContaining({
          toast_type: 'warning'
        }),
        'system'
      );
    });
    
    it('should include additional context in log', async () => {
      const additionalContext = { requestId: '123', userId: '456' };
      
      await notifyAndLog('api', 'error', 'API Error', 'Failed', undefined, 'tenant-1', additionalContext);
      
      expect(logSystemEvent).toHaveBeenCalledWith(
        'api',
        'error',
        expect.objectContaining({
          ...additionalContext
        }),
        'tenant-1'
      );
    });
  });
});
