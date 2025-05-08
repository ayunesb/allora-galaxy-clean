
import { describe, it, expect } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { setupTests } from '../setup/testSetup';
import { validStrategyInput, mockSuccessResponse } from '../mocks/strategyMocks';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

describe('runStrategy Basic Functionality', () => {
  setupTests();
  
  it('should execute a strategy successfully', async () => {
    // Arrange
    const supabaseMock = await import('@/integrations/supabase/client');
    vi.mocked(supabaseMock.supabase.functions.invoke).mockResolvedValueOnce(mockSuccessResponse);
    
    // Act
    const result = await runStrategy(validStrategyInput);
    
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
