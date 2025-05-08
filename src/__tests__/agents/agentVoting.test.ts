
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voteOnAgentVersion } from '@/lib/agents/vote';
import { getUserVote } from '@/lib/agents/voting';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '123', vote_type: 'up' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: '123', vote_type: 'up' },
                error: null,
              }),
            }),
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', vote_type: 'up' },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: { upvotes: 5, downvotes: 2 }, error: null }),
    })
  },
}));

describe('Agent voting functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cast an upvote on an agent version', async () => {
    const result = await voteOnAgentVersion(
      'agent-123',
      'up',
      'user-123',
      'tenant-123',
      'Great agent!'
    );

    expect(result.success).toBe(true);
    expect(result.upvotes).toBe(5);
    expect(result.downvotes).toBe(2);
  });

  it('should cast a downvote on an agent version', async () => {
    const result = await voteOnAgentVersion(
      'agent-123',
      'down',
      'user-123',
      'tenant-123',
      'Needs improvement'
    );

    expect(result.success).toBe(true);
    expect(result.upvotes).toBe(5);
    expect(result.downvotes).toBe(2);
  });

  it('should handle errors when voting fails', async () => {
    // Mock an error response
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Voting failed' },
          }),
        }),
      }),
      update: vi.fn(),
      select: vi.fn(),
      rpc: vi.fn(),
    } as any);

    const result = await voteOnAgentVersion(
      'agent-123',
      'up',
      'user-123',
      'tenant-123'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should retrieve user votes', async () => {
    const result = await getUserVote('agent-123', 'user-123');

    expect(result.hasVoted).toBe(true);
    expect(result.vote).toBeDefined();
  });
});
