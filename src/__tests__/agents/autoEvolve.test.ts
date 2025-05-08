
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
                    { 
                      id: 'agent1', 
                      plugin_id: 'plugin1', 
                      prompt: 'test prompt', 
                      version: 'v1', 
                      upvotes: 1, 
                      downvotes: 5 
                    }
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
            { 
              comment: 'This needs improvement', 
              vote_type: 'down',
              created_at: '2023-01-01T00:00:00Z'
            }
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

// Mock the checkEvolutionNeeded function
vi.mock('@/lib/agents/evolution/checkEvolutionNeeded', () => ({
  checkEvolutionNeeded: vi.fn(async () => ({
    shouldEvolve: true,
    evolveReason: 'Test reason',
    metrics: {
      xp: 100,
      upvotes: 5,
      downvotes: 3,
      totalVotes: 8,
      voteRatio: 0.625,
      totalExecutions: 20,
      successRate: 0.85
    }
  }))
}));

// Mock the createEvolvedAgent function
vi.mock('@/lib/agents/evolution/createEvolvedAgent', () => ({
  createEvolvedAgent: vi.fn(async () => ({
    success: true,
    newAgentVersionId: 'new-agent-id'
  }))
}));

describe('Auto Evolve Agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should evolve agents that need evolution', async () => {
    const tenantId = 'test-tenant';
    
    const result = await autoEvolveAgents(tenantId);
    
    expect(result.success).toBe(true);
    expect(result.evolved).toBeGreaterThan(0);
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
  });
});
