
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput } from "@/lib/strategy/types";

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
    rpc: vi.fn().mockReturnValue('result')
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
      strategy_id: 'strategy1',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toContain('executed successfully');
  });
  
  it('should handle missing strategy_id', async () => {
    // Arrange
    const mockInput = {
      tenant_id: 'tenant1',
      user_id: 'user1'
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
      strategy_id: 'strategy1',
      user_id: 'user1'
    } as ExecuteStrategyInput;
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Tenant ID is required');
  });
  
  it('should handle strategy not found', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'nonexistent',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Mock supabase response for not found
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
  });
  
  it('should handle tenant access denied', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'strategy1',
      tenant_id: 'tenant2', // Different from strategy's tenant_id
      user_id: 'user1'
    };
    
    // Mock supabase response with different tenant_id
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().single.mockImplementationOnce(() => ({
      data: { 
        id: 'strategy1',
        tenant_id: 'tenant1', // Different from input tenant_id
        plugins: []
      },
      error: null
    }));
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Strategy does not belong to the specified tenant');
  });
  
  it('should handle unexpected errors during execution', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategy_id: 'strategy1',
      tenant_id: 'tenant1',
      user_id: 'user1'
    };
    
    // Mock supabase to throw an error
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select.mockImplementationOnce(() => {
      throw new Error('Unexpected database error');
    });
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected database error');
  });
});
