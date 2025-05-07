
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import executeStrategy from "@/edge/executeStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/types/fixed";
import { runStrategy } from "@/lib/strategy/runStrategy";

// Mock the runStrategy function
vi.mock('@/lib/strategy/runStrategy', () => ({
  runStrategy: vi.fn()
}));

describe('executeStrategy Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(runStrategy).mockImplementation((input) => {
      if (!input.strategyId || input.strategyId === 'fail-strategy') {
        return Promise.resolve({
          success: false,
          error: 'Strategy execution failed',
          executionTime: 0.5
        });
      }
      
      return Promise.resolve({
        success: true,
        error: null,
        executionTime: 1.5,
        outputs: { result: 'success' },
        logs: []
      });
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully execute a strategy using the shared utility', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalledWith(input);
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeDefined();
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
    expect(result.error).toContain('Strategy ID is required');
    expect(runStrategy).not.toHaveBeenCalled();
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
    expect(result.error).toContain('Tenant ID is required');
    expect(runStrategy).not.toHaveBeenCalled();
  });
  
  it('should handle strategy execution failure', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategyId: 'fail-strategy',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalledWith(input);
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
    
    // Force runStrategy to throw an error
    vi.mocked(runStrategy).mockImplementationOnce(() => {
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
