
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { castVote, upvoteAgentVersion, downvoteAgentVersion, getUserVote } from '@/lib/agents/voting';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' }
          }
        }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}));

describe('Agent Voting System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('castVote', () => {
    it('should handle a new upvote', async () => {
      // Mock getUserVote to return no current vote
      vi.mocked(getUserVote).mockResolvedValueOnce({ hasVoted: false, vote: null });
      
      // Mock Supabase response for updated agent version
      const supabaseMock = await import('@/integrations/supabase/client');
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { upvotes: 5, downvotes: 2 }, error: null })
        })
      });
      vi.mocked(supabaseMock.supabase.from).mockImplementation((table) => {
        if (table === 'agent_versions') {
          return { select: mockSelect } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          insert: vi.fn().mockResolvedValue({ data: { id: 'new-vote' }, error: null }),
        } as any;
      });
      
      // Execute the vote
      const result = await castVote('agent-123', 'upvote');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.upvotes).toBe(5);
      expect(result.downvotes).toBe(2);
    });
    
    it('should return error if not logged in', async () => {
      // Mock auth to return no session
      const supabaseMock = await import('@/integrations/supabase/client');
      vi.mocked(supabaseMock.supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null }
      } as any);
      
      const result = await castVote('agent-123', 'upvote');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to vote');
    });
    
    it('should handle errors gracefully', async () => {
      // Mock getUserVote to return no current vote
      vi.mocked(getUserVote).mockResolvedValueOnce({ hasVoted: false, vote: null });
      
      // Mock Supabase to throw error
      const supabaseMock = await import('@/integrations/supabase/client');
      vi.mocked(supabaseMock.supabase.from).mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const result = await castVote('agent-123', 'upvote');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to cast vote');
    });
  });
  
  describe('upvoteAgentVersion and downvoteAgentVersion', () => {
    it('should call castVote with upvote type', async () => {
      const mockCastVote = vi.fn().mockResolvedValue({ 
        success: true, 
        upvotes: 5, 
        downvotes: 2 
      });
      
      // Replace the imported castVote with our mock
      const originalCastVote = castVote;
      (globalThis as any).castVote = mockCastVote;
      
      await upvoteAgentVersion('agent-123', 'Great agent!');
      
      expect(mockCastVote).toHaveBeenCalledWith('agent-123', 'upvote', 'Great agent!');
      
      // Restore original function
      (globalThis as any).castVote = originalCastVote;
    });
    
    it('should call castVote with downvote type', async () => {
      const mockCastVote = vi.fn().mockResolvedValue({ 
        success: true, 
        upvotes: 4, 
        downvotes: 3 
      });
      
      // Replace the imported castVote with our mock
      const originalCastVote = castVote;
      (globalThis as any).castVote = mockCastVote;
      
      await downvoteAgentVersion('agent-123', 'Needs improvement');
      
      expect(mockCastVote).toHaveBeenCalledWith('agent-123', 'downvote', 'Needs improvement');
      
      // Restore original function
      (globalThis as any).castVote = originalCastVote;
    });
  });
});
