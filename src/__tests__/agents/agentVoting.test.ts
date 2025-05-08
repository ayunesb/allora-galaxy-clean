
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}));

// Mock logSystemEvent
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

// Import the functions to test after mocking
import {
  recordVote,
  getVoteStats,
  getUserVoteInfo,
  calculateNewXP
} from '@/lib/agents/vote/voteUtils';

describe('Agent Voting System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordVote', () => {
    it('should successfully record a new vote', async () => {
      // Mock implementation for the test
      const mockSupabase = (await import('@/integrations/supabase/client')).supabase;
      
      // Setup mock response
      vi.mocked(mockSupabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({
          data: { id: 'vote-123' },
          error: null
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn()
      }));
      
      // Call the function
      const result = await recordVote({
        agent_version_id: 'agent-123',
        user_id: 'user-123',
        vote_type: 'up',
        comment: 'Great agent!'
      });
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.voteId).toBe('vote-123');
    });

    it('should handle errors when recording a vote', async () => {
      // Mock implementation for the test
      const mockSupabase = (await import('@/integrations/supabase/client')).supabase;
      
      // Setup mock response
      vi.mocked(mockSupabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn()
      }));
      
      // Call the function
      const result = await recordVote({
        agent_version_id: 'agent-123',
        user_id: 'user-123',
        vote_type: 'up'
      });
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('calculateNewXP', () => {
    it('should calculate increased XP for upvotes', () => {
      const result = calculateNewXP(100, 5, 2, 'up');
      expect(result).toBeGreaterThan(100);
    });
    
    it('should calculate decreased XP for downvotes', () => {
      const result = calculateNewXP(100, 5, 2, 'down');
      expect(result).toBeLessThan(100);
    });
    
    it('should never go below zero', () => {
      const result = calculateNewXP(5, 10, 20, 'down');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
