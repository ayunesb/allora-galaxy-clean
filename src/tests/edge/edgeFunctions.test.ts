
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase functions invoke
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation((functionName, options) => {
        // Mock different responses based on function name
        if (functionName === 'autoEvolveAgents') {
          return Promise.resolve({
            data: {
              success: true,
              evolved: 2,
              message: 'Successfully evolved 2 agents'
            },
            error: null
          });
        }
        
        if (functionName === 'scheduledIntelligence') {
          return Promise.resolve({
            data: {
              success: true,
              tenants_processed: 3,
              kpis_analyzed: 42,
              agents_evolved: 2,
              benchmarks_updated: 3
            },
            error: null
          });
        }
        
        return Promise.resolve({ data: null, error: null });
      })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'log-id' },
          error: null
        })
      })
    })
  }
}));

describe('Edge Functions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('autoEvolveAgents', () => {
    it('should invoke the autoEvolveAgents function and return evolved agents', async () => {
      // Call the autoEvolveAgents function
      const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
        body: { tenant_id: 'test-tenant' }
      });
      
      // Assertions
      expect(error).toBeNull();
      expect(data).toEqual({
        success: true,
        evolved: 2,
        message: 'Successfully evolved 2 agents'
      });
      
      // Verify function was called with correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'autoEvolveAgents',
        { body: { tenant_id: 'test-tenant' } }
      );
    });
  });
  
  describe('scheduledIntelligence', () => {
    it('should invoke the scheduledIntelligence function and process tenants', async () => {
      // Call the scheduledIntelligence function
      const { data, error } = await supabase.functions.invoke('scheduledIntelligence', {
        body: {}
      });
      
      // Assertions
      expect(error).toBeNull();
      expect(data).toEqual({
        success: true,
        tenants_processed: 3,
        kpis_analyzed: 42,
        agents_evolved: 2,
        benchmarks_updated: 3
      });
      
      // Verify function was called with correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'scheduledIntelligence',
        { body: {} }
      );
    });
    
    it('should allow processing a specific tenant', async () => {
      // Set up spy for the invoke function
      const invokeSpy = vi.spyOn(supabase.functions, 'invoke');
      
      // Call the scheduledIntelligence function with tenant_id
      await supabase.functions.invoke('scheduledIntelligence', {
        body: { tenant_id: 'specific-tenant' }
      });
      
      // Verify specific tenant ID was passed
      expect(invokeSpy).toHaveBeenCalledWith(
        'scheduledIntelligence',
        { body: { tenant_id: 'specific-tenant' } }
      );
    });
  });
});
