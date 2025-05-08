
import { describe, it, expect } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';
import { validStrategyInput, mockErrorResponse, mockSuccessResponse } from '../mocks/strategyMocks';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

describe('runStrategy Error Handling', () => {
  setupTests();
  
  it('should handle Supabase edge function errors', async () => {
    // Arrange
    const supabaseMock = await import('@/integrations/supabase/client');
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce(mockErrorResponse);
    
    // Act
    const result = await runStrategy(validStrategyInput);
    
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
    const supabaseMock = await import('@/integrations/supabase/client');
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce(mockSuccessResponse);
    vi.mocked(logSystemEvent).mockImplementationOnce(() => {
      throw new Error('Logging failed');
    });
    
    // Act - should not throw despite log failure
    const result = await runStrategy(validStrategyInput);
    
    // Assert
    expect(result.success).toBe(true); // Should still succeed despite logging failure
  });
});
