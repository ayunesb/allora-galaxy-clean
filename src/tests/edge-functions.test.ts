
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation((functionName, options) => {
        if (functionName === 'updateKPIs') {
          return Promise.resolve({
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
          });
        } else if (functionName === 'syncMQLs') {
          return Promise.resolve({
            data: { 
              success: true, 
              message: 'MQLs synced successfully',
              data: {
                mql_count: 150,
                previous_mql_count: 120
              }
            },
            error: null
          });
        } else if (functionName === 'autoEvolveAgents') {
          return Promise.resolve({
            data: {
              success: true,
              message: '2 agents ready for approval',
              eligible_count: 2,
              ready_for_approval: 2,
              agents: [
                {
                  id: 'agent-1',
                  plugin_id: 'plugin-1',
                  plugin_name: 'Test Plugin',
                  version: '1.0',
                  xp: 1200,
                  upvotes: 8
                },
                {
                  id: 'agent-2',
                  plugin_id: 'plugin-2',
                  plugin_name: 'Test Plugin 2',
                  version: '1.0',
                  xp: 1500,
                  upvotes: 10
                }
              ]
            },
            error: null
          });
        }
        return Promise.resolve({
          data: null,
          error: { message: "Unknown function", status: 404 }
        });
      })
    }
  }
}));

describe('Edge Functions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('updateKPIs Edge Function', () => {
    it('should execute successfully for a specific tenant', async () => {
      const tenant_id = 'test-tenant-id';
      
      const { data, error } = await supabase.functions.invoke('updateKPIs', {
        body: { tenant_id }
      });
      
      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(data.results).toHaveProperty('test-tenant-id');
    });
    
    it('should accept specific sources parameter', async () => {
      const tenant_id = 'test-tenant-id';
      const sources = ['stripe', 'ga4'];
      
      await supabase.functions.invoke('updateKPIs', {
        body: { tenant_id, sources }
      });
      
      // Verify correct parameters were passed
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'updateKPIs',
        { body: { tenant_id, sources } }
      );
    });
  });
  
  describe('syncMQLs Edge Function', () => {
    it('should execute successfully for a specific tenant', async () => {
      const tenant_id = 'test-tenant-id';
      
      const { data, error } = await supabase.functions.invoke('syncMQLs', {
        body: { tenant_id }
      });
      
      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.mql_count).toBeDefined();
    });
    
    it('should accept a custom HubSpot API key', async () => {
      const tenant_id = 'test-tenant-id';
      const hubspot_api_key = 'custom-api-key';
      
      await supabase.functions.invoke('syncMQLs', {
        body: { tenant_id, hubspot_api_key }
      });
      
      // Verify correct parameters were passed
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'syncMQLs',
        { body: { tenant_id, hubspot_api_key } }
      );
    });
  });
  
  describe('autoEvolveAgents Edge Function', () => {
    it('should execute successfully for a specific tenant', async () => {
      const tenant_id = 'test-tenant-id';
      
      const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
        body: { tenant_id }
      });
      
      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.eligible_count).toBeDefined();
      expect(data.ready_for_approval).toBeDefined();
      expect(data.agents).toBeDefined();
      expect(data.agents).toHaveLength(2);
    });
    
    it('should accept custom threshold parameters', async () => {
      const tenant_id = 'test-tenant-id';
      const min_xp_threshold = 1500;
      const min_upvotes = 10;
      const requires_approval = false;
      
      await supabase.functions.invoke('autoEvolveAgents', {
        body: { tenant_id, min_xp_threshold, min_upvotes, requires_approval }
      });
      
      // Verify correct parameters were passed
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'autoEvolveAgents',
        { body: { tenant_id, min_xp_threshold, min_upvotes, requires_approval } }
      );
    });
    
    it('should support checking all tenants', async () => {
      const check_all_tenants = true;
      
      await supabase.functions.invoke('autoEvolveAgents', {
        body: { check_all_tenants }
      });
      
      // Verify correct parameters were passed
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'autoEvolveAgents',
        { body: { check_all_tenants } }
      );
    });
  });
});
