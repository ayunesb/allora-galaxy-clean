
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { autoEvolveAgent } from '@/lib/agents/autoEvolve';

// Mock the dependent modules
vi.mock('@/lib/supabase', () => ({
  default: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
  },
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn(),
}));

describe('autoEvolveAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not evolve agent if no votes exist', async () => {
    // Mock the first query for votes to return no results
    const mockSupabase = require('@/lib/supabase').default;
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            execute: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }));

    const result = await autoEvolveAgent({
      agent_version_id: 'agent123',
      tenant_id: 'tenant123',
    });

    expect(result.evolved).toBe(false);
    expect(result.reason).toContain('No votes found');
  });

  it('should not evolve agent if XP threshold not met', async () => {
    // Mock votes but with insufficient XP
    const mockSupabase = require('@/lib/supabase').default;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'agent_votes') {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                execute: async () => ({
                  data: [
                    { id: 'vote1', xp: 50 },
                    { id: 'vote2', xp: 30 },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return mockSupabase;
    });

    const result = await autoEvolveAgent({
      agent_version_id: 'agent123',
      tenant_id: 'tenant123',
      min_xp_threshold: 200, // Higher than total votes XP
    });

    expect(result.evolved).toBe(false);
    expect(result.reason).toContain('XP threshold not met');
  });

  it('should evolve agent when criteria are met', async () => {
    // Mock successful queries and evolution
    const mockSupabase = require('@/lib/supabase').default;
    
    // Mock votes with sufficient XP
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'agent_votes') {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                execute: async () => ({
                  data: [
                    { id: 'vote1', xp: 150 },
                    { id: 'vote2', xp: 150 },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'agent_versions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => ({
                execute: async () => ({
                  data: { 
                    id: 'agent123', 
                    prompt: 'Original prompt',
                    agent_id: 'parent123',
                    created_by: 'user123',
                    version: 1
                  },
                  error: null,
                }),
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              execute: async () => ({
                data: { id: 'newAgent456', version: 2 },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        execute: async () => ({ data: [], error: null }),
      };
    });

    // Mock RPC calls
    mockSupabase.rpc.mockImplementation(() => ({
      execute: async () => ({ data: { success: true }, error: null }),
    }));

    const result = await autoEvolveAgent({
      agent_version_id: 'agent123',
      tenant_id: 'tenant123',
      min_xp_threshold: 200,
      min_upvotes: 2
    });

    expect(result.evolved).toBe(true);
    expect(result.reason).toContain('Agent evolved successfully');
  });
});
