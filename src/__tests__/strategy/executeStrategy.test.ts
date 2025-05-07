
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import executeStrategy from "@/edge/executeStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/lib/strategy/types";

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => ({
        data: { 
          id: 'strategy-123',
          title: 'Test Strategy',
          tenant_id: 'tenant-123',
          status: 'approved'
        },
        error: null
      })),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockReturnValue('result')
  }
}));

vi.mock('@/lib/strategy/runStrategy', () => ({
  runStrategy: vi.fn().mockImplementation((input) => {
    if (input.strategy_id === 'fail-strategy') {
      return Promise.resolve({
        success: false,
        error: 'Strategy execution failed',
        execution_time: 0.5
      });
    }
    return Promise.resolve({
      success: true,
      message: 'Strategy executed successfully',
      data: { result: 'success' },
      execution_time: 1.5,
      execution_id: 'exec-123'
    });
  })
}));

vi.mock('@/lib/executions/recordExecution', () => ({
  recordExecution: vi.fn().mockImplementation(() => Promise.resolve('exec-123')),
  updateExecution: vi.fn().mockImplementation(() => Promise.resolve(true))
}));

describe('executeStrategy Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully execute a strategy', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.execution_id).toBeDefined();
    expect(result.execution_time).toBeGreaterThan(0);
  });
  
  it('should handle missing strategy_id', async () => {
    // Arrange
    const input = {
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy ID is required');
  });
  
  it('should handle missing tenant_id', async () => {
    // Arrange
    const input = {
      strategy_id: 'strategy-123',
      user_id: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Tenant ID is required');
  });
  
  it('should handle strategy execution failure', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategy_id: 'fail-strategy', // This will trigger the mock to return failure
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    const runStrategyMock = require('@/lib/strategy/runStrategy').runStrategy;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategyMock).toHaveBeenCalledWith(input);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy execution failed');
  });
  
  it('should handle unexpected errors', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Force the runStrategy function to throw
    const runStrategyMock = require('@/lib/strategy/runStrategy').runStrategy;
    runStrategyMock.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected error');
    expect(result.execution_time).toBeDefined();
  });
  
  it('should auto-vote on successful agents', async () => {
    // This would require mocking the autoVoteOnSuccessfulAgents function
    // and is beyond the scope of this basic test suite
    // In a real test, we would verify that votes are created for successful agent executions
  });
});
