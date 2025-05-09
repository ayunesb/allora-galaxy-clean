
import { describe, it, expect, vi } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('runStrategy Retry and Resilience', () => {
  setupTests();
  
  it('should retry when temporary errors occur', async () => {
    // Arrange
    const validStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    const supabaseMock = await import('@/integrations/supabase/client');
    
    // Mock temporary error then success
    vi.mocked(supabaseMock.supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Temporary error' }
      })
      .mockResolvedValueOnce({
        data: { 
          success: true,
          execution_id: 'exec-123-retry',
          execution_time: 2.5
        },
        error: null
      });
    
    // Act
    const result = await runStrategy(validStrategyInput);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.execution_id).toBe('exec-123-retry');
  });
});
