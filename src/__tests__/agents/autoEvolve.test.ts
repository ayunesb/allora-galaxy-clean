
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAgentsForEvolution,
  getAgentUsageStats,
  calculateAgentPerformance,
  checkAgentEvolutionNeeded,
  getPluginForAgent,
  createEvolvedAgent,
  deactivateOldAgentVersion,
  autoEvolveAgents
} from '@/lib/agents/autoEvolve';
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(),
      rpc: vi.fn()
    }
  };
});

vi.mock('@/lib/system/logSystemEvent', () => {
  return {
    logSystemEvent: vi.fn().mockResolvedValue(undefined)
  }
});

vi.mock('@/lib/utils/embeddings', () => {
  return {
    getEmbeddingForText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3])
  }
});

describe('Agent Auto-Evolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgentsForEvolution', () => {
    it('should get agents that need evolution', async () => {
      // Mock the supabase response
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: 'agent1', plugin_id: 'plugin1', downvotes: 10, upvotes: 2 },
                    { id: 'agent2', plugin_id: 'plugin2', downvotes: 8, upvotes: 1 }
                  ],
                  error: null
                })
              })
            })
          })
        })
      } as any);

      vi.mocked(supabase.rpc).mockReturnValueOnce('downvotes * 0.3' as any);

      const result = await getAgentsForEvolution();
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('agent1');
      expect(supabase.from).toHaveBeenCalledWith('agent_versions');
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database error')
                })
              })
            })
          })
        })
      } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await getAgentsForEvolution();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getAgentUsageStats', () => {
    it('should get agent usage statistics', async () => {
      // Mock the supabase response
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue({
                data: [
                  { agent_version_id: 'agent1', status: 'success', count: 15 },
                  { agent_version_id: 'agent2', status: 'success', count: 8 }
                ],
                error: null
              })
            })
          })
        })
      } as any);

      const result = await getAgentUsageStats(30);
      
      expect(result).toHaveLength(2);
      expect(result[0].agent_version_id).toBe('agent1');
      expect(result[0].count).toBe(15);
      expect(supabase.from).toHaveBeenCalledWith('plugin_logs');
    });
  });

  describe('calculateAgentPerformance', () => {
    it('should calculate performance score correctly', () => {
      const usageStats: Array<{agent_version_id: string, status: string, count: number}> = [
        { agent_version_id: 'agent1', status: 'success', count: 80 },
        { agent_version_id: 'agent1', status: 'failure', count: 20 },
        { agent_version_id: 'agent2', status: 'success', count: 50 }
      ];

      const score = calculateAgentPerformance('agent1', 30, 10, usageStats);
      
      // Expected calculation: (30/40)*0.7 + (80/100)*0.3 = 0.525 + 0.24 = 0.765
      expect(score).toBeCloseTo(0.765);
    });

    it('should handle no usage data', () => {
      const usageStats: Array<{agent_version_id: string, status: string, count: number}> = [];
      const score = calculateAgentPerformance('agent1', 5, 5, usageStats);
      
      // Expected: (5/10)*0.7 + 0*0.3 = 0.35
      expect(score).toBeCloseTo(0.35);
    });
  });

  describe('checkAgentEvolutionNeeded', () => {
    it('should return true when evolution is needed', async () => {
      const result = await checkAgentEvolutionNeeded('agent1', 2, 10, 0.3);
      expect(result).toBe(true);
    });

    it('should return false when evolution is not needed', async () => {
      const result = await checkAgentEvolutionNeeded('agent1', 8, 2, 0.3);
      expect(result).toBe(false);
    });

    it('should return false when there are not enough votes', async () => {
      const result = await checkAgentEvolutionNeeded('agent1', 1, 1, 0.3);
      expect(result).toBe(false);
    });
  });

  describe('createEvolvedAgent', () => {
    it('should create a new evolved agent version', async () => {
      // Mock the supabase insert response
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-agent-id', version: 'v2' },
              error: null
            })
          })
        })
      } as any);

      const result = await createEvolvedAgent(
        'plugin1',
        'Original prompt',
        'v1',
        ['Feedback 1', 'Feedback 2'],
        'tenant1'
      );
      
      expect(result.id).toBe('new-agent-id');
      expect(result.version).toBe('v2');
      expect(vi.mocked(logSystemEvent)).toHaveBeenCalled();
    });
  });

  describe('autoEvolveAgents', () => {
    it('should auto-evolve agents that need evolution', async () => {
      // Mock getAgentsForEvolution
      vi.mocked(supabase.from)
        // For getAgentsForEvolution
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              gt: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      { 
                        id: 'agent1', 
                        plugin_id: 'plugin1', 
                        prompt: 'Original prompt',
                        version: 'v1',
                        downvotes: 10, 
                        upvotes: 2 
                      }
                    ],
                    error: null
                  })
                })
              })
            })
          })
        } as any)
        // For getAgentUsageStats
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue({
                  data: [
                    { agent_version_id: 'agent1', status: 'success', count: 15 }
                  ],
                  error: null
                })
              })
            })
          })
        } as any)
        // For getAgentFeedbackComments
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockResolvedValue({
                data: [
                  { comment: 'Feedback 1', vote_type: 'down' },
                  { comment: 'Feedback 2', vote_type: 'up' }
                ],
                error: null
              })
            })
          })
        } as any)
        // For createEvolvedAgent
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-agent-id', version: 'v2' },
                error: null
              })
            })
          })
        } as any)
        // For deactivateOldAgentVersion
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        } as any);

      vi.mocked(supabase.rpc).mockReturnValueOnce('downvotes * 0.3' as any);

      const result = await autoEvolveAgents('tenant1');
      
      expect(result.evolved).toBe(1);
      expect(result.success).toBe(true);
      expect(vi.mocked(logSystemEvent)).toHaveBeenCalledTimes(2);
    });

    it('should handle no agents needing evolution', async () => {
      // Mock empty response
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            gt: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })
      } as any);

      vi.mocked(supabase.rpc).mockReturnValueOnce('downvotes * 0.3' as any);

      const result = await autoEvolveAgents('tenant1');
      
      expect(result.evolved).toBe(0);
      expect(result.success).toBe(true);
    });
  });
});
