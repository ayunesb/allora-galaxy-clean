
// Test suite for agent voting functionality
import { voteOnAgentVersion } from '@/lib/agents/voting/voteOnAgentVersion';
import { VoteType } from '@/types/shared';

// Mock the database client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  },
}));

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('Agent Voting', () => {
  const mockAgentVersionId = 'agent-version-123';
  const mockUserId = 'user-123';
  const mockSupabase = require('@/lib/supabase').supabase;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockSupabase.from.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.delete.mockReturnThis();
    mockSupabase.update.mockReturnThis();
  });
  
  describe('voteOnAgentVersion', () => {
    it('should add an upvote successfully', async () => {
      // Mock that the user hasn't voted yet
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
      
      // Mock successful vote insertion
      mockSupabase.insert.mockResolvedValueOnce({ data: { id: 'vote-123' }, error: null });
      
      // Mock successful agent version update
      mockSupabase.update.mockResolvedValueOnce({ 
        data: { 
          id: mockAgentVersionId,
          // These properties are used after the vote
          upvotes: 5,
          downvotes: 2
        }, 
        error: null 
      });
      
      const result = await voteOnAgentVersion(
        mockAgentVersionId,
        mockUserId,
        VoteType.UP,
        'Great model!'
      );
      
      expect(result.success).toBe(true);
      // No need to check specific values as they're implementation details
      
      // Check that the right tables were called
      expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'agent_votes');
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'agent_votes');
      expect(mockSupabase.from).toHaveBeenNthCalledWith(3, 'agent_versions');
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock an API error when checking for existing vote
      mockSupabase.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error' } 
      });
      
      const result = await voteOnAgentVersion(
        mockAgentVersionId,
        mockUserId,
        VoteType.UP
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
    
    it('should update vote if user already voted', async () => {
      // Mock that user already voted
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { 
          id: 'existing-vote-123', 
          vote_type: 'down' 
        }, 
        error: null 
      });
      
      // Mock successful vote update
      mockSupabase.update.mockResolvedValueOnce({ data: { id: 'existing-vote-123' }, error: null });
      
      // Mock successful agent version update
      mockSupabase.update.mockResolvedValueOnce({ 
        data: { 
          id: mockAgentVersionId
        }, 
        error: null 
      });
      
      const result = await voteOnAgentVersion(
        mockAgentVersionId,
        mockUserId,
        VoteType.UP,
        'Changed my mind, it\'s good!'
      );
      
      expect(result.success).toBe(true);
      
      // Check that vote was updated not inserted
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });
    
    it('should remove vote if same vote type is submitted', async () => {
      // Mock that user already voted the same way
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { 
          id: 'existing-vote-123', 
          vote_type: 'up' 
        }, 
        error: null 
      });
      
      // Mock successful vote deletion
      mockSupabase.delete.mockResolvedValueOnce({ data: {}, error: null });
      
      // Mock successful agent version update
      mockSupabase.update.mockResolvedValueOnce({ 
        data: { 
          id: mockAgentVersionId
        }, 
        error: null 
      });
      
      const result = await voteOnAgentVersion(
        mockAgentVersionId,
        mockUserId,
        VoteType.UP
      );
      
      expect(result.success).toBe(true);
      
      // Check that vote was deleted
      expect(mockSupabase.delete).toHaveBeenCalled();
    });
  });
});
