
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { ExecuteStrategyInput } from '@/lib/strategy/types';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { recordExecution, updateExecution } from '@/lib/executions/recordExecution';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => ({
        data: { 
          id: 'strategy1',
          tenant_id: 'tenant1',
          plugins: []
        },
        error: null
      }))
    })),
  },
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue('log1')
}));

vi.mock('@/lib/executions/recordExecution', () => ({
  recordExecution: vi.fn().mockResolvedValue('execution1'),
  updateExecution: vi.fn().mockResolvedValue(true)
}));

describe('Run Strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(100);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should execute a strategy successfully', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'strategy1',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.execution_id).toBe('execution1');
    expect(recordExecution).toHaveBeenCalledWith({
      tenant_id: 'tenant1',
      type: 'strategy',
      status: 'pending',
      strategy_id: 'strategy1',
      executed_by: 'user1',
      input: { strategy_id: 'strategy1' }
    });
    expect(logSystemEvent).toHaveBeenCalledTimes(2);
    expect(updateExecution).toHaveBeenCalledWith('execution1', expect.objectContaining({
      status: 'success'
    }));
  });
  
  it('should handle missing strategy_id', async () => {
    // Arrange
    const mockInput: Partial<ExecuteStrategyInput> = {
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput as ExecuteStrategyInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy ID is required');
    expect(recordExecution).not.toHaveBeenCalled();
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should handle missing tenant_id', async () => {
    // Arrange
    const mockInput: Partial<ExecuteStrategyInput> = {
      strategy_id: 'strategy1',
      user_id: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput as ExecuteStrategyInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Tenant ID is required');
    expect(recordExecution).not.toHaveBeenCalled();
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should handle strategy not found', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'nonexistent',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Mock supabase to return null strategy
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().single.mockImplementationOnce(() => ({
      data: null,
      error: { message: 'Strategy not found' }
    }));
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy not found');
    expect(updateExecution).toHaveBeenCalledWith('execution1', expect.objectContaining({
      status: 'failure',
      error: 'Strategy not found'
    }));
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant1',
      'strategy',
      'strategy_not_found',
      expect.any(Object)
    );
  });
  
  it('should handle tenant access denied', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'strategy1',
      tenant_id: 'tenant2', // Different from strategy's tenant_id
      user_id: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy does not belong to the specified tenant');
    expect(updateExecution).toHaveBeenCalledWith('execution1', expect.objectContaining({
      status: 'failure',
      error: 'Strategy does not belong to the specified tenant'
    }));
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant2',
      'strategy',
      'strategy_access_denied',
      expect.any(Object)
    );
  });
  
  it('should handle unexpected errors during execution', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'strategy1',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Mock recordExecution to throw an error
    const recordExecutionMock = recordExecution as jest.MockedFunction<typeof recordExecution>;
    recordExecutionMock.mockRejectedValueOnce(new Error('Unexpected error'));
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected error');
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant1',
      'strategy',
      'strategy_execution_error',
      expect.any(Object)
    );
  });
});
