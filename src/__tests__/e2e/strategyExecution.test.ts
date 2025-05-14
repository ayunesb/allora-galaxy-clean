
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { recordExecution } from '@/lib/executions/recordExecution';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          success: true,
          execution_id: 'exec-123',
          status: 'complete',
          plugins_executed: 2,
          successful_plugins: 2,
          execution_time: 1.5
        },
        error: null
      })
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'execution-record-123' },
            error: null
          })
        })
      })
    }))
  }
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(true),
  __esModule: true,
  default: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/executions/recordExecution', () => ({
  recordExecution: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 'execution-record-123' }
  })
}));

describe('Strategy Execution End-to-End Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute strategy and record the results', async () => {
    // Call the runStrategy function
    const result = await runStrategy({
      strategyId: 'strategy-123',
      tenantId: 'tenant-123',
      userId: 'user-123'
    });

    // Verify edge function invocation
    expect(result.success).toBe(true);
    expect(result.executionId).toBe('exec-123');
    
    // Verify execution recording
    expect(recordExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-123',
        strategyId: 'strategy-123',
        executedBy: 'user-123',
        status: 'success'
      })
    );
  });

  it('should handle failures in the execution process', async () => {
    // Mock edge function failure
    const supabase = await import('@/integrations/supabase/client');
    vi.mocked(supabase.supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: 'Strategy execution failed' }
    });

    // Call the runStrategy function
    const result = await runStrategy({
      strategyId: 'failed-strategy',
      tenantId: 'tenant-123',
      userId: 'user-123'
    });

    // Verify failure handling
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    // Verify failure was recorded
    expect(recordExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-123',
        strategyId: 'failed-strategy',
        status: 'failure',
        error: expect.any(String)
      })
    );
  });

  it('should handle edge cases in the strategy execution flow', async () => {
    // Test with partial execution success
    const supabase = await import('@/integrations/supabase/client');
    vi.mocked(supabase.supabase.functions.invoke).mockResolvedValueOnce({
      data: {
        success: true,
        execution_id: 'partial-exec-123',
        status: 'partial',
        plugins_executed: 3,
        successful_plugins: 1,
        failed_plugins: 2,
        execution_time: 2.5
      },
      error: null
    });

    // Call the runStrategy function
    const result = await runStrategy({
      strategyId: 'partial-strategy',
      tenantId: 'tenant-123',
      userId: 'user-123'
    });

    // Verify partial success handling
    expect(result.success).toBe(true);
    expect(result.executionId).toBe('partial-exec-123');
    expect(result.status).toBe('partial');
    
    // Verify partial success was recorded correctly
    expect(recordExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-123',
        strategyId: 'partial-strategy',
        status: 'success', // The overall execution is still successful
        output: expect.objectContaining({
          successful_plugins: 1,
          failed_plugins: 2
        })
      })
    );
  });
});
