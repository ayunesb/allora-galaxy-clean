
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
    vi.mocked(runStrategy).mockImplementation(() => {
      return Promise.resolve({
        success: true,
        error: undefined,
        strategy_id: 'strategy-123',
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
  });
});
