
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput } from "@/types/fixed";

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => ({
        data: { 
          id: 'strategy1',
          tenant_id: 'tenant1',
          plugins: []
        },
        error: null
      }))
    })),
    rpc: vi.fn().mockReturnValue('result'),
    functions: {
      invoke: vi.fn().mockImplementation(() => ({
        data: { 
          success: true,
          error: null,
          executionTime: 1.5
        },
        error: null
      }))
    }
  },
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue('log1')
}));

vi.mock('@/lib/executions/recordExecution', () => ({
  recordExecution: vi.fn().mockResolvedValue('execution1'),
  updateExecution: vi.fn().mockResolvedValue(true)
}));

describe('Execute Strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should execute a strategy', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy1',
      tenantId: 'tenant1',
      userId: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true);
  });
  
  it('should handle missing strategy_id', async () => {
    // Arrange
    const mockInput = {
      tenantId: 'tenant1',
      userId: 'user1'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy ID is required');
  });
  
  it('should handle missing tenant_id', async () => {
    // Arrange
    const mockInput = {
      strategyId: 'strategy1',
      userId: 'user1'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Tenant ID is required');
  });
  
  it('should handle errors from the edge function', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy1',
      tenantId: 'tenant1',
      userId: 'user1'
    };
    
    // Mock supabase response for error
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.functions.invoke.mockImplementationOnce(() => ({
      data: null,
      error: { message: 'Edge function error' }
    }));
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error executing strategy: Edge function error');
  });
});
