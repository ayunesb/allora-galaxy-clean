
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput } from '@/types/strategy/fixed';

// Mock key dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  default: vi.fn().mockResolvedValue({ success: true })
}));

describe('Strategy Input Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject execution with missing inputs', async () => {
    // Test with undefined input
    const result1 = await runStrategy(undefined);
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('Strategy ID is required');
    
    // Test with missing strategyId
    const result2 = await runStrategy({ tenantId: 'tenant-1', userId: 'user-1' } as ExecuteStrategyInput);
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('Strategy ID is required');
    
    // Test with missing tenantId
    const result3 = await runStrategy({ strategyId: 'strategy-1', userId: 'user-1' } as ExecuteStrategyInput);
    expect(result3.success).toBe(false);
    expect(result3.error).toContain('Tenant ID is required');
  });

  it('should accept valid inputs', async () => {
    // Mock the invoke function to return a success response
    const mockInvokeResponse = { 
      data: { 
        success: true, 
        execution_id: 'exec-123',
        status: 'success'
      }, 
      error: null 
    };
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.functions.invoke.mockResolvedValue(mockInvokeResponse);
    
    // Call with valid inputs
    const validInput: ExecuteStrategyInput = {
      strategyId: 'strategy-1',
      tenantId: 'tenant-1',
      userId: 'user-1'
    };
    
    const result = await runStrategy(validInput);
    
    expect(result.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'executeStrategy',
      expect.objectContaining({
        body: {
          strategy_id: 'strategy-1',
          tenant_id: 'tenant-1',
          user_id: 'user-1',
        }
      })
    );
  });
});
