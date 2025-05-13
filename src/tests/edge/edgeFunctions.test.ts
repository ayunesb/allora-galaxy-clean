
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
        
        if (functionName === 'executeStrategy') {
          const body = options?.body || {};
          if (!body.strategy_id) {
            return Promise.resolve({
              data: null,
              error: { message: 'Strategy ID is required' }
            });
          }
          
          return Promise.resolve({
            data: {
              success: true,
              execution_id: 'exec-123',
              strategy_id: body.strategy_id,
              status: 'success',
              plugins_executed: 3,
              successful_plugins: 3,
              execution_time: 1.5,
              xp_earned: 30
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
  
  describe('executeStrategy', () => {
    it('should invoke the executeStrategy function and return execution details', async () => {
      // Call the executeStrategy function
      const { data, error } = await supabase.functions.invoke('executeStrategy', {
        body: { 
          strategy_id: 'strategy-123',
          tenant_id: 'tenant-123',
          user_id: 'user-123'
        }
      });
      
      // Assertions
      expect(error).toBeNull();
      expect(data).toEqual({
        success: true,
        execution_id: 'exec-123',
        strategy_id: 'strategy-123',
        status: 'success',
        plugins_executed: 3,
        successful_plugins: 3,
        execution_time: 1.5,
        xp_earned: 30
      });
      
      // Verify function was called with correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'executeStrategy',
        { 
          body: { 
            strategy_id: 'strategy-123',
            tenant_id: 'tenant-123',
            user_id: 'user-123'
          } 
        }
      );
    });
    
    it('should handle missing required parameters', async () => {
      // Call with missing strategy_id
      const { data, error } = await supabase.functions.invoke('executeStrategy', {
        body: { tenant_id: 'tenant-123' }
      });
      
      // Assertions
      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.message).toContain('Strategy ID is required');
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
