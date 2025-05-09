
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoEvolveAgents } from '@/lib/agents/evolution';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation((functionName, config) => {
        if (functionName === 'autoEvolveAgents') {
          // Simulate success response
          return Promise.resolve({
            data: {
              success: true,
              evolved: 2,
              agents: [
                { id: 'agent-1', previousId: 'old-agent-1', performance: 0.65 },
                { id: 'agent-2', previousId: 'old-agent-2', performance: 0.55 }
              ],
              message: 'Successfully evolved 2 agents'
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: new Error('Unknown function') });
      })
    }
  }
}));

describe('Agent Auto-Evolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should trigger auto evolution for all tenants', async () => {
    const result = await autoEvolveAgents();
    
    expect(result).toEqual({
      success: true,
      evolved: 2,
      agents: [
        { id: 'agent-1', previousId: 'old-agent-1', performance: 0.65 },
        { id: 'agent-2', previousId: 'old-agent-2', performance: 0.55 }
      ],
      message: 'Successfully evolved 2 agents'
    });
  });
  
  it('should allow filtering by tenant ID', async () => {
    const tenantId = 'test-tenant-123';
    await autoEvolveAgents(tenantId);
    
    // Check that the supabase function was called with the tenant ID
    expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
      'autoEvolveAgents',
      {
        body: {
          tenant_id: tenantId,
          options: undefined
        }
      }
    );
  });
  
  it('should allow configuring evolution options', async () => {
    const options = {
      evolutionThreshold: 0.7,
      minimumExecutions: 10,
      failureRateThreshold: 0.2,
      staleDays: 30
    };
    
    await autoEvolveAgents(undefined, options);
    
    // Check that the supabase function was called with the specified options
    expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
      'autoEvolveAgents',
      {
        body: {
          tenant_id: undefined,
          options
        }
      }
    );
  });
});
