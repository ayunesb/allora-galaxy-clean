
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput } from "@/types/fixed";

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation(() => Promise.resolve({
        data: { 
          success: true,
          execution_id: 'exec-123',
          execution_time: 1.5
        },
        error: null
      }))
    }
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined),
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined)
}));

describe('runStrategy Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should execute a strategy successfully', async () => {
    // Arrange
    const mockInput: ExecuteStrategyInput = {
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    };
    
    // Act
    const result = await runStrategy(mockInput);
    
    // Assert
    expect(result.success).toBe(true);
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
  
  it('should validate required fields', async () => {
    // Arrange
    const missingStrategyId = {
      tenantId: 'tenant-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    const missingTenantId = {
      strategyId: 'strategy-123',
      userId: 'user-123'
    } as ExecuteStrategyInput;
    
    // Act
    const result1 = await runStrategy(missingStrategyId);
    const result2 = await runStrategy(missingTenantId);
    
    // Assert
    expect(result1.success).toBe(false);
    expect(result1.error).toBe('Strategy ID is required');
    
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('Tenant ID is required');
  });
});
