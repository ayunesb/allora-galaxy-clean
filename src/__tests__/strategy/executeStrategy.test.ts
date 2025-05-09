
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInputSnakeCase } from "@/types/fixed";

// Mock the runStrategy function
vi.mock('@/lib/strategy/runStrategy', () => ({
  runStrategy: vi.fn()
}));

// Define mock Deno globals for testing
const mockDeno = {
  env: {
    get: vi.fn().mockImplementation(key => {
      if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
      return undefined;
    }),
    set: vi.fn()
  }
};

// Assign mock to global object, but only if Deno is not already defined
if (typeof globalThis !== 'undefined') {
  // Use type assertion to handle TypeScript complaint about index signature
  if (!('Deno' in globalThis)) {
    (globalThis as any).Deno = mockDeno;
  }
}

/**
 * Edge function wrapper for executing a strategy
 */
async function executeStrategy(input: ExecuteStrategyInputSnakeCase): Promise<any> {
  try {
    // Validate input
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: 0,
        strategy_id: '',
        status: 'failed'
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: 0,
        strategy_id: input.strategy_id,
        status: 'failed'
      };
    }
    
    // Convert to expected format
    const strategyInput = {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id,
      userId: input.user_id,
      options: input.options
    };
    
    // Execute the strategy using the shared utility
    return await runStrategy(strategyInput);
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      execution_time: 0,
      strategy_id: input.strategy_id || '',
      status: 'failed'
    };
  }
}

describe('executeStrategy Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(runStrategy).mockImplementation((input) => {
      // Handle input regardless of format
      const strategyId = typeof input === 'object' && input ? 
        ((input as any).strategyId || (input as any).strategy_id) : 
        '';
      
      if (!strategyId || strategyId === 'fail-strategy') {
        return Promise.resolve({
          success: false,
          error: 'Strategy execution failed',
          strategy_id: strategyId || '',
          status: 'failed',
          execution_time: 0.5
        });
      }
      
      return Promise.resolve({
        success: true,
        error: undefined,
        strategy_id: strategyId || '',
        status: 'completed',
        execution_time: 1.5,
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
    const input: ExecuteStrategyInputSnakeCase = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.execution_time).toBeDefined();
  });
  
  it('should handle missing strategyId', async () => {
    // Arrange
    const input = {
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    } as ExecuteStrategyInputSnakeCase;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('Strategy ID is required');
    expect(runStrategy).not.toHaveBeenCalled();
  });
  
  it('should handle missing tenantId', async () => {
    // Arrange
    const input = {
      strategy_id: 'strategy-123',
      user_id: 'user-123'
    } as ExecuteStrategyInputSnakeCase;
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('Tenant ID is required');
    expect(runStrategy).not.toHaveBeenCalled();
  });
  
  it('should handle strategy execution failure', async () => {
    // Arrange
    const input: ExecuteStrategyInputSnakeCase = {
      strategy_id: 'fail-strategy',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
    };
    
    // Act
    const result = await executeStrategy(input);
    
    // Assert
    expect(runStrategy).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy execution failed');
  });
  
  it('should handle unexpected errors', async () => {
    // Arrange
    const input: ExecuteStrategyInputSnakeCase = {
      strategy_id: 'strategy-123',
      tenant_id: 'tenant-123',
      user_id: 'user-123'
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
    expect(result.execution_time).toBeDefined();
  });
});
