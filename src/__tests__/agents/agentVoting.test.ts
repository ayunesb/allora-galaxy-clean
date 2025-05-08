
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { voteOnAgentVersion } from '@/lib/agents/voting/voteOnAgentVersion';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

describe('Agent Voting System', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock responses
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    } as any);
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { upvotes: 5, downvotes: 2 },
            error: null
          })
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-vote-id' },
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    } as any);
    
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null
    });
  });

  it('should upvote an agent version', async () => {
    const result = await voteOnAgentVersion('test-agent-id', 'upvote');
    
    expect(result.success).toBe(true);
    expect(result.upvotes).toEqual(5);
    expect(result.downvotes).toEqual(2);
    
    // Verify supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith('agent_votes');
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
  });

  it('should downvote an agent version', async () => {
    const result = await voteOnAgentVersion('test-agent-id', 'downvote');
    
    expect(result.success).toBe(true);
    expect(result.upvotes).toEqual(5);
    expect(result.downvotes).toEqual(2);
    
    // Verify supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith('agent_votes');
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
  });

  it('should handle already voted cases', async () => {
    // Mock that the user already voted
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { vote_type: 'upvote' },
              error: null
            })
          })
        })
      })
    } as any);
    
    const result = await voteOnAgentVersion('test-agent-id', 'downvote');
    
    expect(result.success).toBe(true);
  });

  it('should fail when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null
    } as any);
    
    const result = await voteOnAgentVersion('test-agent-id', 'upvote');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('logged in');
  });
});
