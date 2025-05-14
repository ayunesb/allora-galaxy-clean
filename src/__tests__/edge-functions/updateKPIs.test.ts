
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { 
          success: true, 
          message: 'KPIs updated successfully',
          results: {
            'test-tenant': {
              metrics: [
                { name: 'Monthly Recurring Revenue', value: 8500, previous_value: 8000 },
                { name: 'Customer Acquisition Cost', value: 350 }
              ]
            }
          }
        },
        error: null
      })
    }
  }
}));

describe('updateKPIs Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update KPIs for a tenant', async () => {
    const mockInput = {
      tenant_id: 'test-tenant',
      sources: ['stripe', 'ga4']
    };
    
    const result = await supabase.functions.invoke('updateKPIs', {
      body: mockInput
    });
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data.success).toBe(true);
    expect(result.data.results['test-tenant'].metrics).toHaveLength(2);
    expect(result.data.results['test-tenant'].metrics[0].name).toBe('Monthly Recurring Revenue');
    
    // Verify function was called with correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith('updateKPIs', {
      body: mockInput
    });
  });
  
  it('should handle empty sources array', async () => {
    // Mock different response for this specific test
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { 
        success: true, 
        message: 'KPIs updated successfully for all sources',
        results: {
          'test-tenant': {
            metrics: [
              { name: 'Monthly Recurring Revenue', value: 8500 },
              { name: 'Customer Acquisition Cost', value: 350 },
              { name: 'Active Users', value: 1250 },
              { name: 'Conversion Rate', value: 3.5, unit: '%' }
            ]
          }
        }
      },
      error: null
    });
    
    const mockInput = {
      tenant_id: 'test-tenant',
      sources: [] // empty sources array should update all sources
    };
    
    const result = await supabase.functions.invoke('updateKPIs', {
      body: mockInput
    });
    
    expect(result.error).toBeNull();
    expect(result.data.success).toBe(true);
    expect(result.data.results['test-tenant'].metrics).toHaveLength(4);
  });
  
  it('should handle missing tenant_id parameter', async () => {
    // Mock error response
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { 
        success: false, 
        error: "Missing required parameter: tenant_id"
      },
      error: null
    });
    
    const mockInput = {
      sources: ['stripe']
    };
    
    const result = await supabase.functions.invoke('updateKPIs', {
      body: mockInput
    });
    
    expect(result.data.success).toBe(false);
    expect(result.data.error).toContain('tenant_id');
  });
  
  it('should handle specific source parameter', async () => {
    // Mock response for only Stripe KPIs
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { 
        success: true, 
        message: 'KPIs updated successfully for stripe',
        results: {
          'test-tenant': {
            metrics: [
              { name: 'Monthly Recurring Revenue', value: 8500, previous_value: 8000 },
              { name: 'Total Customers', value: 120, previous_value: 110 }
            ],
            source: 'stripe'
          }
        }
      },
      error: null
    });
    
    const mockInput = {
      tenant_id: 'test-tenant',
      sources: ['stripe'] // only update Stripe KPIs
    };
    
    const result = await supabase.functions.invoke('updateKPIs', {
      body: mockInput
    });
    
    expect(result.data.success).toBe(true);
    expect(result.data.results['test-tenant'].source).toBe('stripe');
    expect(result.data.results['test-tenant'].metrics).toHaveLength(2);
  });
  
  it('should handle edge function errors', async () => {
    // Mock an error from the edge function
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Internal server error',
        details: 'Error connecting to the database'
      }
    });
    
    const mockInput = {
      tenant_id: 'test-tenant',
      sources: ['stripe', 'ga4']
    };
    
    const result = await supabase.functions.invoke('updateKPIs', {
      body: mockInput
    });
    
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe('Internal server error');
  });
});
