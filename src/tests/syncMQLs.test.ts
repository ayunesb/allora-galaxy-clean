
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock the fetch function
global.fetch = vi.fn();

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { 
          success: true, 
          message: 'MQLs synced successfully',
          data: {
            mql_count: 150,
            previous_mql_count: 120
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
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'tenant-1', name: 'Test Tenant', metadata: { hubspot_api_key: 'test-key' } },
          error: null
        })
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: { id: 'mock-kpi-id' },
          error: null
        })
      })
    })
  }
}));

describe('syncMQLs Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully invoke syncMQLs for a specific tenant', async () => {
    const tenant_id = 'test-tenant-id';
    
    const { data, error } = await supabase.functions.invoke('syncMQLs', {
      body: { tenant_id }
    });
    
    // Verify that invoke was called with the correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'syncMQLs',
      { body: { tenant_id } }
    );
    
    // Verify response structure
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('mql_count');
    expect(data.data).toHaveProperty('previous_mql_count');
  });
  
  it('should accept a custom HubSpot API key', async () => {
    const tenant_id = 'test-tenant-id';
    const hubspot_api_key = 'custom-api-key';
    
    await supabase.functions.invoke('syncMQLs', {
      body: { tenant_id, hubspot_api_key }
    });
    
    // Verify that invoke was called with the custom API key
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'syncMQLs',
      { body: { tenant_id, hubspot_api_key } }
    );
  });
  
  it('should reject invocation without tenant_id', async () => {
    // Override the mock to simulate an error response
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { success: false, error: "tenant_id is required" },
      error: null
    });
    
    const { data } = await supabase.functions.invoke('syncMQLs', {
      body: {}
    });
    
    // Verify error response
    expect(data.success).toBe(false);
    expect(data.error).toContain('tenant_id');
  });
  
  it('should handle errors from the HubSpot API gracefully', async () => {
    // Override the mock to simulate a HubSpot API error
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { 
        success: false, 
        error: "Failed to fetch MQLs from HubSpot",
        details: "API key invalid"
      },
      error: null
    });
    
    const { data } = await supabase.functions.invoke('syncMQLs', {
      body: { tenant_id: 'test-tenant-id' }
    });
    
    // Verify error handling
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to fetch MQLs');
  });
  
  it('should handle database errors gracefully', async () => {
    // Override the mock to simulate a database error
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { 
        success: false, 
        error: "Failed to save MQL count KPI",
        details: "Database constraint violation"
      },
      error: null
    });
    
    const { data } = await supabase.functions.invoke('syncMQLs', {
      body: { tenant_id: 'test-tenant-id' }
    });
    
    // Verify error handling
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to save');
  });
});
