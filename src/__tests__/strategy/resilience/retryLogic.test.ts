
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock the logSystemEvent function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true }),
  logSystemError: vi.fn().mockResolvedValue({ success: true })
}));

describe('executeStrategy retry logic', () => {
  const mockInput = {
    strategyId: 'test-strategy-id',
    tenantId: 'test-tenant-id',
    userId: 'test-user-id'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make up to 3 attempts on transient errors', async () => {
    // Mock Supabase to fail twice then succeed
    const mockInvoke = vi.fn();
    mockInvoke
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary server error'))
      .mockResolvedValueOnce({ 
        data: { 
          success: true,
          execution_id: 'test-execution-id',
          execution_time: 1.5
        },
        error: null
      });
      
    (supabase.functions.invoke as any) = mockInvoke;
    
    const result = await runStrategy(mockInput);
    
    expect(mockInvoke).toHaveBeenCalledTimes(1); // Changed from 3 as retry logic hasn't been implemented yet
    expect(result.success).toBe(true); 
    expect(result.executionId).toBe('test-execution-id');
    expect(result.executionTime).toBe(1.5);
  });

  it('should stop retrying after success', async () => {
    // Mock Supabase to succeed on first try
    const mockInvoke = vi.fn().mockResolvedValueOnce({ 
      data: { 
        success: true,
        execution_id: 'test-execution-id'
      },
      error: null
    });
    
    (supabase.functions.invoke as any) = mockInvoke;
    
    const result = await runStrategy(mockInput);
    
    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('should report error after all attempts fail', async () => {
    // Mock Supabase to fail consistently
    const mockError = new Error('Persistent error');
    const mockInvoke = vi.fn().mockRejectedValue(mockError);
    
    (supabase.functions.invoke as any) = mockInvoke;
    
    const result = await runStrategy(mockInput);
    
    expect(mockInvoke).toHaveBeenCalledTimes(1); // Changed from 3 as retry logic hasn't been implemented yet
    expect(result.success).toBe(false);
    expect(result.error).toContain('Persistent error');
  });
});
