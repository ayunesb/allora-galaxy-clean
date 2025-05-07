
import { expect, test, describe, vi } from 'vitest';
import { vi as viImport } from 'vitest';
import * as autoEvolve from '@/lib/agents/autoEvolve';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
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
    })),
    rpc: vi.fn(),
  },
}));

describe('Agent Auto Evolution', () => {
  test('should check if agent should be promoted based on XP', async () => {
    // Mock the RPC call for agent votes
    const mockAgentVotes = {
      data: [
        { vote_value: 10, created_at: '2023-01-01T00:00:00Z' },
        { vote_value: 8, created_at: '2023-01-02T00:00:00Z' },
        { vote_value: 9, created_at: '2023-01-03T00:00:00Z' },
      ],
      error: null,
    };
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue(mockAgentVotes),
    }));

    const result = await autoEvolve.checkAgentForPromotion('agent-1');
    
    expect(result).toEqual({
      shouldPromote: true,
      reason: expect.stringContaining('score of'),
    });
  });

  test('should not promote agent with low XP', async () => {
    // Mock agent votes with low scores
    const mockAgentVotes = {
      data: [
        { vote_value: 2, created_at: '2023-01-01T00:00:00Z' },
        { vote_value: 3, created_at: '2023-01-02T00:00:00Z' },
        { vote_value: 1, created_at: '2023-01-03T00:00:00Z' },
      ],
      error: null,
    };
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue(mockAgentVotes),
    }));

    const result = await autoEvolve.checkAgentForPromotion('agent-2');
    
    expect(result).toEqual({
      shouldPromote: false,
      reason: expect.stringContaining('not high enough'),
    });
  });

  test('should evolve agent with enough positive votes', async () => {
    // Mock successful evolution
    const mockAgentData = {
      data: { id: 'agent-1', name: 'Test Agent', prompt: 'Original prompt' },
      error: null
    };
    
    const mockInsertResponse = {
      data: { id: 'new-agent-1' },
      error: null
    };
    
    vi.spyOn(autoEvolve, 'checkAgentForPromotion').mockResolvedValue({
      shouldPromote: true,
      reason: 'Mock reason for promotion'
    });
    
    (supabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockAgentData),
    })).mockImplementationOnce(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(mockInsertResponse),
    })).mockImplementationOnce(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));

    const result = await autoEvolve.checkAndEvolveAgent('agent-1');
    
    expect(result).toEqual({
      evolved: true,
      reason: expect.any(String),
    });
  });

  test('should handle multiple agents for auto-evolution', async () => {
    // Mock list of agent versions
    const mockAgentVersions = {
      data: [
        { id: 'agent-1', name: 'Agent 1', tenant_id: 'tenant-1', is_active: true },
        { id: 'agent-2', name: 'Agent 2', tenant_id: 'tenant-1', is_active: true },
      ],
      error: null
    };
    
    (supabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue(mockAgentVersions),
    }));
    
    // Mock the individual agent evolution
    vi.spyOn(autoEvolve, 'checkAndEvolveAgent')
      .mockResolvedValueOnce({ evolved: true, reason: 'Evolved agent 1' })
      .mockResolvedValueOnce({ evolved: false, reason: 'No need to evolve agent 2' });

    const result = await autoEvolve.checkAndEvolveAgents('tenant-1');
    
    expect(result.evolvedCount).toEqual(1);
    expect(result.results.length).toEqual(2);
    expect(result.results[0].evolved).toEqual(true);
    expect(result.results[1].evolved).toEqual(false);
  });
});
