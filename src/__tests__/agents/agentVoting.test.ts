
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { voteOnAgentVersion } from '@/lib/agents/vote';
import { mockSupabase } from '@/lib/__mocks__/supabaseClient';

// Mock the supabase import in the vote module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Agent Voting System', () => {
  beforeEach(() => {
    // Reset the mock data store before each test
    mockSupabase._resetStore();
  });

  it('should insert a new vote record when voting', async () => {
    const result = await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user1',
    });

    // Check that vote was inserted
    expect(mockSupabase._dataStore.agent_votes.length).toBe(1);
    expect(mockSupabase._dataStore.agent_votes[0].agent_version_id).toBe('agent1');
    expect(mockSupabase._dataStore.agent_votes[0].vote_type).toBe('up');
    expect(result.success).toBe(true);
  });

  it('should update vote counts correctly', async () => {
    // First vote
    await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user1',
    });

    // Second vote from different user
    const result = await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user2',
    });

    expect(result.success).toBe(true);
    expect(result.upvotes).toBe(2);
    expect(result.downvotes).toBe(0);
  });

  it('should handle downvotes correctly', async () => {
    // Upvote
    await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user1',
    });

    // Downvote from another user
    const result = await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'down',
      userId: 'user2',
    });

    expect(result.success).toBe(true);
    expect(result.upvotes).toBe(1);
    expect(result.downvotes).toBe(1);
  });

  it('should prevent duplicate votes from the same user', async () => {
    // First vote
    await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user1',
    });

    // Mock specific behavior for duplicate vote scenario
    vi.spyOn(mockSupabase, 'from').mockImplementationOnce(() => ({
      insert: () => ({
        error: {
          code: '23505', // Unique violation in Postgres
          message: 'duplicate key value violates unique constraint',
        },
      }),
    }));

    // Try to vote again
    const result = await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'up',
      userId: 'user1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already voted');
  });

  it('should update an existing vote when changing vote type', async () => {
    // Setup: Insert an initial upvote
    mockSupabase._dataStore.agent_votes = [
      { 
        id: 'vote1', 
        agent_version_id: 'agent1', 
        user_id: 'user1',
        vote_type: 'up',
        created_at: new Date().toISOString()
      }
    ];

    // Mock update behavior
    const updateSpy = vi.fn().mockReturnValue({
      error: null,
    });

    vi.spyOn(mockSupabase, 'from').mockImplementationOnce(() => ({
      insert: () => ({
        error: {
          code: '23505', // Unique constraint violation
        },
      }),
      update: updateSpy,
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => ({
              data: { id: 'vote1', vote_type: 'up' },
              error: null,
            }),
          }),
        }),
      }),
    }));

    // Change vote from up to down
    await voteOnAgentVersion({
      agentVersionId: 'agent1',
      voteType: 'down',
      userId: 'user1',
    });

    // Verify the update was called
    expect(updateSpy).toHaveBeenCalledWith({ vote_type: 'down' });
  });
});
