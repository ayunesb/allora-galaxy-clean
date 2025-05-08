
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import executeStrategy from "@/edge/executeStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/types/strategy";
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
      const convertedInput = typeof input === 'object' ? input : {};
      const strategyId = (convertedInput as any).strategyId || (convertedInput as any).strategy_id;
      
      if (!strategyId || strategyId === 'fail-strategy') {
        return Promise.resolve({
          success: false,
          error: 'Strategy execution failed',
          executionTime: 0.5
        } as ExecuteStrategyResult);
      }
      
      return Promise.resolve({
        success: true,
        error: undefined,
        executionTime: 1.5,
        outputs: { result: 'success' },
        logs: []
      } as ExecuteStrategyResult);
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully execute a strategy using the shared utility', async () => {
    // Arrange
    const input: ExecuteStrategyInput = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Convert input to match the expected format in the implementation
    const convertedInput = {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id
    };
    
    // Act
    // @ts-ignore - Ignoring type mismatch for testing purposes
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeDefined();
  });
  
  it('should handle missing strategyId', async () => {
    // Arrange
    const input = {
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    // @ts-ignore - Ignoring type mismatch for testing purposes
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
      strategy_id: 'strategy-123',
      user_id: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    // @ts-ignore - Ignoring type mismatch for testing purposes
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
      strategy_id: 'fail-strategy',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Act
    // @ts-ignore - Ignoring type mismatch for testing purposes
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalled();
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
    
    // Force runStrategy to throw an error
    vi.mocked(runStrategy).mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Act
    // @ts-ignore - Ignoring type mismatch for testing purposes
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected error');
    expect(result.executionTime).toBeDefined();
  });
});
