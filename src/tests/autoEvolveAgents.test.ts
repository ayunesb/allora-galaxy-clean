
import { describe, test, expect, vi, beforeEach } from 'vitest';
import autoEvolveAgent from '@/lib/agents/autoEvolve';

// Mock supabase
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

// Mock log system event
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn(),
}));

describe('autoEvolveAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns false if no votes are found', async () => {
    // Mock the first query for votes to return empty array
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
      agent_version_id: '123',
      tenant_id: 'tenant-123',
      min_xp_threshold: 200,
      min_upvotes: 3,
      requires_approval: false
    });

    expect(result.evolved).toBe(false);
    expect(result.reason).toContain('No votes found');
  });

  test('returns false if XP threshold not met', async () => {
    // Mock votes with insufficient XP
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
                    { id: 'vote2', xp: 50 },
                    { id: 'vote3', xp: 50 },
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
      agent_version_id: '123',
      tenant_id: 'tenant-123',
      min_xp_threshold: 200,
      min_upvotes: 3,
      requires_approval: false
    });

    expect(result.evolved).toBe(false);
    expect(result.reason).toContain('XP threshold not met');
  });

  test('returns false if upvote count not met', async () => {
    // Mock votes with sufficient XP but insufficient count
    const mockSupabase = require('@/lib/supabase').default;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'agent_votes') {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                execute: async () => ({
                  data: [
                    { id: 'vote1', xp: 150 },
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
      agent_version_id: '123',
      tenant_id: 'tenant-123',
      min_xp_threshold: 100,
      min_upvotes: 3
    });

    expect(result.evolved).toBe(false);
    expect(result.reason).toContain('Minimum upvote count not met');
  });

  test('evolves agent when all criteria are met', async () => {
    // Mock successful evolution
    const mockSupabase = require('@/lib/supabase').default;
    
    // Mock votes with sufficient XP and count
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'agent_votes') {
        return {
          select: () => ({
            eq: () => ({
              gt: () => ({
                execute: async () => ({
                  data: [
                    { id: 'vote1', xp: 100 },
                    { id: 'vote2', xp: 100 },
                    { id: 'vote3', xp: 100 },
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
                    id: 'agent-123', 
                    prompt: 'Original prompt',
                    agent_id: 'parent-123',
                    created_by: 'user-123',
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
                data: { id: 'new-agent-456', version: 2 },
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
      agent_version_id: '123',
      tenant_id: 'tenant-123',
    });

    expect(result.evolved).toBe(true);
    expect(result.reason).toContain('Agent evolved successfully');
  });
});
