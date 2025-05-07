
import { expect, test, describe, vi, beforeEach } from 'vitest';
import * as autoEvolve from '@/lib/agents/autoEvolve';
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      group: vi.fn().mockReturnThis(),
      count: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

describe('Agent Auto Evolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('should check if agent should be promoted based on XP and votes', async () => {
    // Mock the supabase responses
    const mockAgent = {
      data: {
        id: 'agent-1',
        upvotes: 12, 
        downvotes: 3,
        xp: 150,
        version: '1.0.0'
      },
      error: null
    };
    
    const mockExecutionStats = {
      data: [
        { status: 'success', count: 15 },
        { status: 'failure', count: 5 }
      ],
      error: null
    };
    
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'agent_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockAgent)
            })
          })
        };
      } else if (table === 'plugin_logs') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                group: () => ({
                  count: () => Promise.resolve(mockExecutionStats)
                })
              })
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };
    });

    const result = await autoEvolve.checkAgentForPromotion('agent-1');
    
    expect(result.shouldPromote).toBe(true);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.votes.total).toBe(15);
    expect(result.metrics.executions.rate).toBe(0.75);
  });

  test('should not promote agent with low XP', async () => {
    // Mock agent with low XP
    const mockAgentLowXP = {
      data: {
        id: 'agent-2',
        upvotes: 12, 
        downvotes: 3,
        xp: 50, // Below the 100 threshold
        version: '1.0.0'
      },
      error: null
    };
    
    const mockExecutionStats = {
      data: [
        { status: 'success', count: 15 },
        { status: 'failure', count: 5 }
      ],
      error: null
    };
    
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'agent_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockAgentLowXP)
            })
          })
        };
      } else if (table === 'plugin_logs') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                group: () => ({
                  count: () => Promise.resolve(mockExecutionStats)
                })
              })
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };
    });

    const result = await autoEvolve.checkAgentForPromotion('agent-2');
    
    expect(result.shouldPromote).toBe(false);
    expect(result.reason).toContain('insufficient XP');
    expect(result.metrics.xp).toBe(50);
  });

  test('should evolve agent with enough positive votes', async () => {
    // Mock successful agent data
    const mockAgentData = {
      data: { 
        id: 'agent-3', 
        name: 'Test Agent', 
        prompt: 'Original prompt', 
        plugin_id: 'plugin-1',
        version: '1.0.5'
      },
      error: null
    };
    
    // Mock votes data
    const mockVotes = {
      data: [
        { vote_type: 'up', comment: 'Good job!' },
        { vote_type: 'down', comment: 'Could be better at X' }
      ],
      error: null
    };
    
    // Mock insert response for new agent
    const mockInsertResponse = {
      data: { id: 'new-agent-3', version: '1.0.6' },
      error: null
    };
    
    // Mock update response
    const mockUpdateResponse = {
      error: null
    };
    
    // Setup mocks
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'agent_versions' && arguments.callee.caller?.name?.includes('checkAndEvolveAgent')) {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(mockAgentData)
            })
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve(mockInsertResponse)
            })
          }),
          update: () => ({
            eq: () => Promise.resolve(mockUpdateResponse)
          })
        };
      } else if (table === 'agent_votes') {
        return {
          select: () => ({
            eq: () => ({
              not: () => ({
                order: () => ({
                  limit: () => Promise.resolve(mockVotes)
                })
              })
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };
    });
    
    // Mock the promotion check function
    vi.spyOn(autoEvolve, 'checkAgentForPromotion').mockResolvedValue({
      shouldPromote: true,
      reason: 'Test promotion',
      metrics: {
        votes: { up: 10, down: 2, total: 12 },
        executions: { success: 15, failure: 5, total: 20, rate: 0.75 },
        xp: 120
      }
    });

    const result = await autoEvolve.checkAndEvolveAgent('agent-3', 'tenant-1');
    
    expect(result.evolved).toBe(true);
    expect(result.agentId).toBe('agent-3');
    expect(result.newAgentId).toBeDefined();
    expect(result.newVersion).toBeDefined();
    expect(logSystemEvent).toHaveBeenCalledWith(
      'tenant-1',
      'agent',
      'agent_auto_evolved',
      expect.objectContaining({
        old_agent_id: 'agent-3',
        new_agent_id: expect.any(String)
      })
    );
  });

  test('should handle multiple agents for auto-evolution', async () => {
    // Mock list of agent versions
    const mockAgentVersions = {
      data: [
        { id: 'agent-4', name: 'Agent 4', plugin_id: 'plugin-1', version: '1.0.0' },
        { id: 'agent-5', name: 'Agent 5', plugin_id: 'plugin-2', version: '2.0.0' },
      ],
      error: null
    };
    
    (supabase.from as any).mockImplementationOnce((table) => {
      if (table === 'agent_versions') {
        return {
          select: () => ({
            eq: () => ({
              in: () => Promise.resolve(mockAgentVersions)
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
      };
    });
    
    // Mock the individual agent evolution
    vi.spyOn(autoEvolve, 'checkAndEvolveAgent')
      .mockResolvedValueOnce({ 
        evolved: true, 
        reason: 'Evolved agent 4', 
        agentId: 'agent-4',
        newAgentId: 'new-agent-4',
        version: '1.0.0',
        newVersion: '1.0.1'
      })
      .mockResolvedValueOnce({ 
        evolved: false, 
        reason: 'No need to evolve agent 5',
        agentId: 'agent-5'
      });

    const result = await autoEvolve.checkAndEvolveAgents('tenant-1');
    
    expect(result.evolvedCount).toBe(1);
    expect(result.results.length).toBe(2);
    expect(result.results[0].evolved).toBe(true);
    expect(result.results[1].evolved).toBe(false);
    expect(result.errors).toBeUndefined();
  });
  
  test('should handle errors gracefully during evolution', async () => {
    // Mock list of agent versions
    const mockAgentVersions = {
      data: [
        { id: 'agent-6', name: 'Agent 6', plugin_id: 'plugin-3', version: '1.0.0' },
        { id: 'agent-7', name: 'Agent 7', plugin_id: 'plugin-4', version: '1.0.0' },
      ],
      error: null
    };
    
    (supabase.from as any).mockImplementationOnce((table) => {
      if (table === 'agent_versions') {
        return {
          select: () => ({
            eq: () => ({
              in: () => Promise.resolve(mockAgentVersions)
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
      };
    });
    
    // Mock one successful evolution and one error
    vi.spyOn(autoEvolve, 'checkAndEvolveAgent')
      .mockResolvedValueOnce({ 
        evolved: true, 
        reason: 'Evolved agent 6', 
        agentId: 'agent-6',
        newAgentId: 'new-agent-6'
      })
      .mockImplementationOnce(() => {
        throw new Error('Test error evolving agent 7');
      });
      
    const result = await autoEvolve.checkAndEvolveAgents('tenant-1');
    
    expect(result.evolvedCount).toBe(1);
    expect(result.results.length).toBe(2);
    expect(result.results[0].evolved).toBe(true);
    expect(result.results[1].evolved).toBe(false);
    expect(result.results[1].reason).toContain('Error processing agent');
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBe(1);
    expect(result.errors?.[0]).toContain('agent-7');
  });
});
