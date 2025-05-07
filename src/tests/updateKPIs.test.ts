
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { 
          success: true, 
          message: 'KPIs updated successfully', 
          results: {
            'test-tenant-id': { 
              metrics: [
                { name: 'Monthly Recurring Revenue', value: 8500, previous_value: 8000 },
                { name: 'Customer Acquisition Cost', value: 350 }
              ]
            }
          }
        },
        error: null
      })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'mock-log-id' }],
          error: null
        })
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockReturnValue({
          data: { id: 'tenant-1', name: 'Test Tenant' },
          error: null
        })
      })
    })
  }
}));

describe('updateKPIs Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully invoke updateKPIs for a specific tenant', async () => {
    const tenant_id = 'test-tenant-id';
    
    const { data, error } = await supabase.functions.invoke('updateKPIs', {
      body: { tenant_id, run_mode: 'manual' }
    });
    
    // Verify that invoke was called with the correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'updateKPIs',
      { body: { tenant_id, run_mode: 'manual' } }
    );
    
    // Verify response structure
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
    expect(data.results).toHaveProperty('test-tenant-id');
    expect(data.results['test-tenant-id'].metrics).toHaveLength(2);
  });
  
  it('should handle specific data sources', async () => {
    const tenant_id = 'test-tenant-id';
    const sources = ['stripe'];
    
    await supabase.functions.invoke('updateKPIs', {
      body: { tenant_id, sources }
    });
    
    // Verify that invoke was called with the correct sources parameter
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'updateKPIs',
      { body: { tenant_id, sources } }
    );
  });
  
  it('should reject invocation without tenant_id', async () => {
    // Override the mock to simulate an error response
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { success: false, error: "Missing required parameter: tenant_id" },
      error: null
    });
    
    const { data } = await supabase.functions.invoke('updateKPIs', {
      body: {}
    });
    
    // Verify error response
    expect(data.success).toBe(false);
    expect(data.error).toContain('tenant_id');
  });
  
  it('should handle errors gracefully', async () => {
    // Override the mock to simulate an error
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: "Function execution error", status: 500 }
    });
    
    const { data, error } = await supabase.functions.invoke('updateKPIs', {
      body: { tenant_id: 'test-tenant-id' }
    });
    
    // Verify error handling
    expect(data).toBeNull();
    expect(error).toBeDefined();
    expect(error.message).toBe("Function execution error");
  });
});
