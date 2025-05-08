
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';
import { validStrategyInput, mockTemporaryErrorResponse, mockRetrySuccessResponse } from '../mocks/strategyMocks';

describe('runStrategy Retry and Resilience', () => {
  setupTests();
  
  it('should retry when temporary errors occur', async () => {
    // Arrange
    const supabaseMock = await import('@/integrations/supabase/client');
    
    // Mock temporary error then success
    vi.mocked(supabaseMock.supabase.functions.invoke)
      .mockResolvedValueOnce(mockTemporaryErrorResponse)
      .mockResolvedValueOnce(mockRetrySuccessResponse);
    
    // Mock timer
    vi.useFakeTimers();
    
    // Act - this will run the first attempt, hit an error, then retry automatically
    const resultPromise = runStrategy(validStrategyInput);
    
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
