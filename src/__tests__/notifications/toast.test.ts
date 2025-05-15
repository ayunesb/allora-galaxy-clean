
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from '@/lib/notifications/toast';

// Mock the actual toast library
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('Toast utility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should call success toast with the correct message', () => {
    toast.success('Test success message');
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Test success message', expect.any(Object));
  });
  
  it('should call error toast with the correct message', () => {
    toast.error('Test error message');
    expect(require('sonner').toast.error).toHaveBeenCalledWith('Test error message', expect.any(Object));
  });
  
  it('should call info toast with the correct message', () => {
    toast.info('Test info message');
    expect(require('sonner').toast.info).toHaveBeenCalledWith('Test info message', expect.any(Object));
  });
  
  it('should call warning toast with the correct message', () => {
    toast.warning('Test warning message');
    expect(require('sonner').toast.warning).toHaveBeenCalledWith('Test warning message', expect.any(Object));
  });
  
  it('should merge user options with default options', () => {
    const userOptions = { duration: 5000 };
    toast.success('Test message with options', userOptions);
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Test message with options', expect.objectContaining(userOptions));
  });
});
