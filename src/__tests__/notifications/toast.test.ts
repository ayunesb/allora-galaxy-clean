
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import { notify, notifySuccess, notifyError, notifyWarning, notifyInfo } from '@/lib/notifications/toast';

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    custom: vi.fn()
  }
}));

describe('Toast Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('notify', () => {
    it('should call toast with the correct parameters', () => {
      notify({
        title: 'Test Notification',
        description: 'This is a test notification',
        variant: 'default'
      });
      
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          description: 'This is a test notification'
        })
      );
    });
    
    it('should handle notifications without description', () => {
      notify({
        title: 'Simple Notification'
      });
      
      expect(toast.custom).toHaveBeenCalled();
    });
    
    it('should handle custom icons', () => {
      const mockIcon = '<div>Icon</div>';
      
      notify({
        title: 'With Icon',
        icon: mockIcon
      });
      
      expect(toast.custom).toHaveBeenCalled();
    });
    
    it('should pass through additional options', () => {
      notify({
        title: 'With Options',
        duration: 5000,
        position: 'bottom-right'
      });
      
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 5000,
          position: 'bottom-right'
        })
      );
    });
  });
  
  describe('notifySuccess', () => {
    it('should call toast.success with the correct parameters', () => {
      notifySuccess('Success Message', 'Success Description');
      
      expect(toast.success).toHaveBeenCalledWith(
        'Success Message',
        expect.objectContaining({
          description: 'Success Description'
        })
      );
    });
    
    it('should handle calls without a description', () => {
      notifySuccess('Simple Success');
      
      expect(toast.success).toHaveBeenCalledWith(
        'Simple Success',
        expect.any(Object)
      );
    });
  });
  
  describe('notifyError', () => {
    it('should call toast.error with the correct parameters', () => {
      notifyError('Error Message', 'Error Description');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Error Message',
        expect.objectContaining({
          description: 'Error Description'
        })
      );
    });
    
    it('should handle calls without a description', () => {
      notifyError('Simple Error');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Simple Error',
        expect.any(Object)
      );
    });
  });
  
  describe('notifyWarning', () => {
    it('should call toast.warning with the correct parameters', () => {
      notifyWarning('Warning Message', 'Warning Description');
      
      expect(toast.warning).toHaveBeenCalledWith(
        'Warning Message',
        expect.objectContaining({
          description: 'Warning Description'
        })
      );
    });
  });
  
  describe('notifyInfo', () => {
    it('should call toast.info with the correct parameters', () => {
      notifyInfo('Info Message', 'Info Description');
      
      expect(toast.info).toHaveBeenCalledWith(
        'Info Message',
        expect.objectContaining({
          description: 'Info Description'
        })
      );
    });
  });
});
