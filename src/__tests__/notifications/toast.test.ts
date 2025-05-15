
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from '@/lib/notifications/toast';

// Mock sonner's toast
vi.mock('sonner', () => {
  const mockToast = vi.fn();
  mockToast.success = vi.fn();
  mockToast.error = vi.fn();
  mockToast.info = vi.fn();
  mockToast.warning = vi.fn();
  mockToast.loading = vi.fn();
  mockToast.dismiss = vi.fn();
  
  return { toast: mockToast };
});

describe('toast notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show success toast', () => {
    const message = 'Operation successful';
    toast.success(message);
    
    // Import the mocked module to access the mock functions
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.success).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('should show error toast', () => {
    const message = 'An error occurred';
    toast.error(message);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.error).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('should show warning toast', () => {
    const message = 'Warning message';
    toast.warning(message);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.warning).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('should show info toast', () => {
    const message = 'Information message';
    toast.info(message);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.info).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('should show loading toast', () => {
    const message = 'Loading...';
    toast.loading(message);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.loading).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('should dismiss toast by ID', () => {
    const toastId = 'test-id';
    toast.dismiss(toastId);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.dismiss).toHaveBeenCalledWith(toastId);
  });

  it('should handle custom options', () => {
    const message = 'Custom options';
    const options = { duration: 5000, id: 'custom-id' };
    toast.success(message, options);
    
    const { toast: mockedToast } = require('sonner');
    expect(mockedToast.success).toHaveBeenCalledWith(message, expect.objectContaining(options));
  });
});
