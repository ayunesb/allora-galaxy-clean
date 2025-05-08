
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
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

describe('runStrategy Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should execute a strategy successfully', async () => {
    // Arrange
    const mockInput = {
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
});
