
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import executeStrategy from "@/edge/executeStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/types/fixed";

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
    if (input.strategyId === 'fail-strategy') {
      return Promise.resolve({
        success: false,
        error: 'Strategy execution failed',
        executionTime: 0.5
      });
    }
    return Promise.resolve({
      success: true,
      message: 'Strategy executed successfully',
      data: { result: 'success' },
      executionTime: 1.5,
      executionId: 'exec-123'
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
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.executionId).toBeDefined();
    expect(result.executionTime).toBeGreaterThan(0);
  });
  
  it('should handle missing strategyId', async () => {
    // Arrange
    const input = {
      tenantId: 'tenant-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Invalid input');
  });
  
  it('should handle missing tenantId', async () => {
    // Arrange
    const input = {
      strategyId: 'strategy-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Invalid input');
  });
  
  it('should handle strategy execution failure', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategyId: 'fail-strategy', // This will trigger the mock to return failure
      tenantId: 'tenant-123',
      userId: 'user-123'
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
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
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
    expect(result.executionTime).toBeDefined();
  });
});
