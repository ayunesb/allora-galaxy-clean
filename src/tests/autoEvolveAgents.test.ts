
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoEvolveAgents } from '@/lib/agents/evolution';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            gt: vi.fn(() => ({
              lt: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({
                  data: [
                    { id: 'agent1', plugin_id: 'plugin1', prompt: 'test prompt', version: 'v1', upvotes: 1, downvotes: 5 }
                  ],
                  error: null
                }))
              }))
            }))
          }))
        })),
        gte: vi.fn(() => ({
          is: vi.fn(() => ({
            groupBy: vi.fn(() => Promise.resolve({
              data: [
                { agent_version_id: 'agent1', status: 'success', count: 10 }
              ],
              error: null
            }))
          }))
        })),
        not: vi.fn(() => Promise.resolve({
          data: [
            { comment: 'This needs improvement', vote_type: 'down' }
          ],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'new-agent-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      multiply_value: () => 1.5 // Mock for the multiply_value RPC function
    }))
  }
}));

// Mock the logSystemEvent function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn(() => Promise.resolve())
}));

describe('Auto Evolve Agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should evolve agents that need evolution', async () => {
    const tenantId = 'test-tenant';
    
    const result = await autoEvolveAgents({ tenantId });
    
    expect(result.success).toBe(true);
    expect(result.agentsEvolved).toBeGreaterThan(0);
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
  });
});
