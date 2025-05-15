
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifySuccess, notifyError, notifyWarning, notifyInfo, notifyPromise } from '@/lib/notifications/toast';

// Mock the toast library
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
      custom: vi.fn()
    }
  }))
}));

// Import the mocked module to access our spy
import { useToast } from '@/components/ui/use-toast';

describe('Toast notification utilities', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(), 
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn()
  };
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Setup mock implementation
    (useToast as any).mockImplementation(() => ({
      toast: mockToast
    }));
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should call success toast with correct parameters', () => {
    notifySuccess('Test success message');
    
    expect(mockToast.success).toHaveBeenCalledWith({
      title: expect.any(String),
      description: 'Test success message'
    });
  });
  
  it('should call error toast with correct parameters', () => {
    notifyError('Test error message');
    
    expect(mockToast.error).toHaveBeenCalledWith({
      title: expect.any(String),
      description: 'Test error message'
    });
  });
  
  it('should call info toast with correct parameters', () => {
    notifyInfo('Test info message');
    
    expect(mockToast.info).toHaveBeenCalledWith({
      title: expect.any(String),
      description: 'Test info message'
    });
  });
  
  it('should call warning toast with correct parameters', () => {
    notifyWarning('Test warning message');
    
    expect(mockToast.warning).toHaveBeenCalledWith({
      title: expect.any(String),
      description: 'Test warning message'
    });
  });
  
  it('should handle promise notifications', async () => {
    const mockPromise = Promise.resolve('Success result');
    
    await notifyPromise(
      mockPromise,
      {
        loading: 'Loading...',
        success: () => 'Success!',
        error: () => 'Error!'
      }
    );
    
    expect(mockToast.loading).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Loading...'
    }));
    
    expect(mockToast.success).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Success!'
    }));
  });
});
