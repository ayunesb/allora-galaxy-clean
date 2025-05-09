
import { describe, it, expect, vi } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';

// Mock dependencies
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined),
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined)
}));

describe('runStrategy Error Handling', () => {
  setupTests();
  
  it('should handle Supabase edge function errors', async () => {
    // Arrange
    const validStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const supabaseMock = await import('@/integrations/supabase/client');
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: 'Edge function error' }
    });
    
    // Act
    const result = await runStrategy(validStrategyInput);
    
    // Assert
    expect(result.success).toBe(false);
  });
  
  it('should continue even if logSystemEvent fails', async () => {
    // Arrange
    const validStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const logSystemEvent = await import('@/lib/system/logSystemEvent');
    vi.mocked(logSystemEvent.default).mockImplementationOnce(() => {
      throw new Error('Logging failed');
    });
    
    // Act - should not throw despite log failure
    const result = await runStrategy(validStrategyInput);
    
    // Assert
    expect(result.success).toBe(true); // Should still succeed despite logging failure
  });
});
