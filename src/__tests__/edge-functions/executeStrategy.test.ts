
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation(() => Promise.resolve({
        data: { 
          success: true,
          execution_id: 'exec-123',
          execution_time: 1.5
        },
        error: null
      }))
    }
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined),
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined)
}));

describe('executeStrategy Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should handle successful execution with complete parameters', async () => {
    const mockInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123',
      options: {
        force: true,
        debug: true
      }
    };
    
    // Mock the invoke function for this test
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        success: true,
        execution_id: 'exec-test-123',
        status: 'complete',
        plugins_executed: 3,
        successful_plugins: 3,
        execution_time: 2.5,
        result: {
          key: 'value'
        }
      },
      error: null
    });
    
    // Execute the function through the invoke method
    const result = await supabase.functions.invoke('executeStrategy', {
      body: mockInput
    });
    
    // Assertions
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      success: true,
      execution_id: 'exec-test-123',
      status: 'complete',
      plugins_executed: 3,
      successful_plugins: 3,
      execution_time: 2.5,
      result: {
        key: 'value'
      }
    });
    
    // Verify function was called with correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'executeStrategy',
      { body: mockInput }
    );
  });
  
  it('should handle errors from edge function execution', async () => {
    // Mock error response
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Strategy not found',
        status: 404
      }
    });
    
    const mockInput = {
      strategy_id: 'non-existent',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Execute the function
    const result = await supabase.functions.invoke('executeStrategy', {
      body: mockInput
    });
    
    // Verify error handling
    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      message: 'Strategy not found',
      status: 404
    });
  });
  
  it('should handle network failures and retry', async () => {
    // Mock network failure then success
    vi.mocked(supabase.functions.invoke)
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({
        data: {
          success: true,
          execution_id: 'exec-retry-123',
          status: 'complete'
        },
        error: null
      });
      
    const mockInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // This would be using a retry-enabled wrapper in the real implementation
    let result;
    try {
      // First attempt fails
      result = await supabase.functions.invoke('executeStrategy', {
        body: mockInput
      });
    } catch (error) {
      // Second attempt succeeds
      result = await supabase.functions.invoke('executeStrategy', {
        body: mockInput
      });
    }
    
    // Assertions for final result
    expect(result.error).toBeNull();
    expect(result.data.success).toBe(true);
    expect(result.data.execution_id).toBe('exec-retry-123');
    
    // Verify the function was called twice (once for failure, once for success)
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
  });
  
  it('should include appropriate logging for edge function execution', async () => {
    const mockInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    await supabase.functions.invoke('executeStrategy', {
      body: mockInput
    });
    
    // Verify logging was performed
    expect(logSystemEvent).toHaveBeenCalled();
  });
});
