
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordExecution, updateExecution, getExecution, getRecentExecutions } from '@/lib/executions/recordExecution';
import { LogStatus, ExecutionRecordInput } from '@/types/fixed';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-execution-id' }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'test-execution-id', status: 'updated' }, 
              error: null 
            }))
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-execution-id', status: 'success' },
            error: null
          }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [{ id: 'test-execution-1' }, { id: 'test-execution-2' }],
            error: null
          }))
        }))
      })),
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [{ id: 'test-execution-1' }, { id: 'test-execution-2' }],
            error: null
          }))
        }))
      }))
    })),
  }
}));

describe('Execution Record Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should record a new execution', async () => {
    const input: ExecutionRecordInput = {
      tenantId: 'test-tenant',
      status: 'success' as LogStatus,
      type: 'strategy',
    };

    const result = await recordExecution(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBe('test-execution-id');
    expect(supabase.from).toHaveBeenCalledWith('executions');
  });
  
  it('should update an existing execution', async () => {
    const result = await updateExecution('test-execution-id', {
      status: 'success' as LogStatus,
      executionTime: 1.5,
      xpEarned: 10
    });
    
    expect(result).toBeDefined();
    expect(result.id).toBe('test-execution-id');
    expect(result.status).toBe('updated');
    expect(supabase.from).toHaveBeenCalledWith('executions');
  });
  
  it('should get an execution by ID', async () => {
    const result = await getExecution('test-execution-id');
    
    expect(result).toBeDefined();
    expect(result?.id).toBe('test-execution-id');
    expect(result?.status).toBe('success');
    expect(supabase.from).toHaveBeenCalledWith('executions');
  });
  
  it('should get recent executions for a tenant', async () => {
    const results = await getRecentExecutions('test-tenant');
    
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('test-execution-1');
    expect(supabase.from).toHaveBeenCalledWith('executions');
  });
  
  it('should handle retry logic if insert fails', async () => {
    // Setup mock to fail once then succeed
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      insert: vi.fn(() => {
        throw new Error('Temporary error');
      }),
    } as any)).mockImplementationOnce(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'retry-success-id' }, 
            error: null 
          }))
        }))
      })),
    } as any));
    
    // Mock setTimeout properly to avoid TS2741 error
    const originalSetTimeout = global.setTimeout;
    const mockedSetTimeout = vi.fn((callback: Function) => {
      callback();
      return 1 as unknown as NodeJS.Timeout;
    });
    
    global.setTimeout = mockedSetTimeout;
    
    const input: ExecutionRecordInput = {
      tenantId: 'test-tenant',
      status: 'success' as LogStatus,
      type: 'strategy',
    };
    
    const result = await recordExecution(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBe('retry-success-id');
    expect(supabase.from).toHaveBeenCalledTimes(2); // Once for fail, once for success
    
    // Restore original setTimeout
    global.setTimeout = originalSetTimeout;
  });
});
