
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { 
  voteOnAgentVersion, 
  upvoteAgentVersion
} from '@/lib/agents/voting/voteOnAgentVersion';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

describe('Agent Voting Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('voteOnAgentVersion', () => {
    it('should successfully record a vote and update agent version stats', async () => {
      // Mock responses for successful vote
      const mockVoteInsert = vi.fn().mockResolvedValue({
        data: { id: 'vote-123' },
        error: null
      });

      const mockAgentVersionGet = vi.fn().mockResolvedValue({
        data: { upvotes: 5, downvotes: 2 },
        error: null
      });

      const mockAgentVersionUpdate = vi.fn().mockResolvedValue({
        data: { id: 'agent-123', upvotes: 6, downvotes: 2 },
        error: null
      });

      // Set up the mock chain
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'agent_votes') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: mockVoteInsert
              })
            })
          };
        } else if (table === 'agent_versions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockAgentVersionGet
              })
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockAgentVersionUpdate
              })
            })
          };
        }
        return {};
      });

      // Call the function with an "up" vote
      const result = await voteOnAgentVersion({
        agentVersionId: 'agent-123',
        userId: 'user-123',
        voteType: 'up',
        comment: 'Great work!'
      });

      // Expectations
      expect(result.success).toBe(true);
      expect(result.voteId).toBe('vote-123');
      expect(mockAgentVersionUpdate).toHaveBeenCalled();
    });

    it('should handle errors when recording a vote', async () => {
      // Mock error response
      (supabase.from as any).mockImplementation(() => {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        };
      });

      // Call the function with an "up" vote
      const result = await voteOnAgentVersion({
        agentVersionId: 'agent-123',
        userId: 'user-123',
        voteType: 'up'
      });

      // Expectations
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('upvoteAgentVersion', () => {
    it('should call voteOnAgentVersion with the correct parameters', async () => {
      // Create a spy on voteOnAgentVersion
      const voteOnAgentVersionSpy = vi.fn().mockResolvedValue({
        success: true,
        voteId: 'vote-123'
      });
      
      // Replace the implementation temporarily
      const originalVoteOnAgentVersion = globalThis.voteOnAgentVersion;
      (globalThis as any).voteOnAgentVersion = voteOnAgentVersionSpy;
      
      // Call upvoteAgentVersion
      const result = await upvoteAgentVersion({
        agentVersionId: 'agent-123',
        userId: 'user-123',
        comment: 'Great job!'
      });
      
      // Restore the original implementation
      (globalThis as any).voteOnAgentVersion = originalVoteOnAgentVersion;
      
      // Expectations
      expect(voteOnAgentVersionSpy).toHaveBeenCalledWith({
        agentVersionId: 'agent-123',
        userId: 'user-123',
        voteType: 'up',
        comment: 'Great job!'
      });
      expect(result.success).toBe(true);
      expect(result.voteId).toBe('vote-123');
    });
  });
});
