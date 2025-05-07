
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput } from "@/types/fixed";
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
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

describe('runStrategy Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should execute a strategy successfully', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const supabaseMock = await import('@/integrations/supabase/client');
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true);
    expect(supabaseMock.supabase.functions.invoke).toHaveBeenCalledWith(
      'executeStrategy',
      expect.objectContaining({ body: expect.any(Object) })
    );
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant-123', 
      'strategy', 
      'execute_strategy_started',
      expect.objectContaining({ strategy_id: 'strategy-123' })
    );
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant-123', 
      'strategy', 
      'execute_strategy_completed',
      expect.objectContaining({ strategy_id: 'strategy-123' })
    );
  });
  
  it('should handle null or undefined inputs properly', async () => {
    // Test undefined input
    const result1 = await runStrategy(undefined as any);
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Strategy ID is required');
    
    // Test null input
    const result2 = await runStrategy(null as any);
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Strategy ID is required');
  });
  
  it('should validate required fields', async () => {
    // Arrange
    const missingStrategyId = {
      tenantId: 'tenant-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    const missingTenantId = {
      strategyId: 'strategy-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result1 = await runStrategy(missingStrategyId);
    const result2 = await runStrategy(missingTenantId);
    
    // Assert
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Strategy ID is required');
    
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Tenant ID is required');
  });
  
  it('should handle Supabase edge function errors', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Mock Supabase error response
    const supabaseMock = await import('@/integrations/supabase/client');
    vi.mocked(supabaseMock.supabase.functions.invoke).mockImplementationOnce(() => 
      Promise.resolve({
        data: null,
        error: { message: 'Edge function error' }
      })
    );
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error executing strategy: Edge function error');
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant-123', 
      'strategy', 
      'execute_strategy_error',
      expect.objectContaining({ 
        strategy_id: 'strategy-123', 
        error: 'Edge function error'
      })
    );
  });
  
  it('should continue even if logSystemEvent fails', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Make logSystemEvent throw an error
    vi.mocked(logSystemEvent).mockImplementation(() => {
      throw new Error('Logging failed');
    });
    
    // Act - should not throw despite log failure
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true); // Should still succeed despite logging failure
  });
  
  it('should retry when temporary errors occur', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const supabaseMock = await import('@/integrations/supabase/client');
    
    // Mock temporary error then success
    vi.mocked(supabaseMock.supabase.functions.invoke)
      .mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: { message: 'Temporary error' }
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: { 
          success: true,
          execution_id: 'exec-123-retry',
          execution_time: 2.5
        },
        error: null
      }));
    
    // Mock timer
    vi.useFakeTimers();
    
    // Act - this will run the first attempt, hit an error, then retry automatically
    const resultPromise = runStrategy(mockInput);
    
    // Fast forward past the retry delay
    vi.advanceTimersByTime(2000);
    
    const result = await resultPromise;
    
    // Restore real timers
    vi.useRealTimers();
    
    // Assert
    expect(result.success).toBe(true);
    expect(supabaseMock.supabase.functions.invoke).toHaveBeenCalledTimes(2);
    expect(result.execution_id).toBe('exec-123-retry');
  });
});
