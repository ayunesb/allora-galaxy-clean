
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { voteOnAgentVersion } from '@/lib/agents/vote';
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent'; 

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-vote-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

// Mock the logSystemEvent function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn(() => Promise.resolve())
}));

describe('Agent Voting System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully record an upvote', async () => {
    const voteData = {
      agentVersionId: 'test-agent-id',
      userId: 'test-user-id',
      tenantId: 'test-tenant-id',
      voteType: 'up' as const,
      comment: 'Great performance!'
    };
    
    const result = await voteOnAgentVersion(
      voteData.agentVersionId,
      voteData.voteType,
      voteData.userId,
      voteData.tenantId,
      voteData.comment
    );
    
    expect(result.success).toBe(true);
    expect(result.voteId).toBe('test-vote-id');
    expect(supabase.from).toHaveBeenCalledWith('agent_votes');
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
    expect(logSystemEvent).toHaveBeenCalledWith(
      voteData.tenantId, 
      'agent', 
      'agent_voted',
      expect.objectContaining({
        agent_version_id: voteData.agentVersionId,
        vote_type: voteData.voteType
      })
    );
  });

  it('should successfully record a downvote', async () => {
    const voteData = {
      agentVersionId: 'test-agent-id',
      userId: 'test-user-id',
      tenantId: 'test-tenant-id',
      voteType: 'down' as const,
      comment: 'Could be improved'
    };
    
    const result = await voteOnAgentVersion(
      voteData.agentVersionId,
      voteData.voteType,
      voteData.userId,
      voteData.tenantId,
      voteData.comment
    );
    
    expect(result.success).toBe(true);
    expect(result.voteId).toBe('test-vote-id');
    expect(supabase.from).toHaveBeenCalledWith('agent_votes');
    expect(supabase.from).toHaveBeenCalledWith('agent_versions');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock an error when inserting vote
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    } as any));
    
    const voteData = {
      agentVersionId: 'test-agent-id',
      userId: 'test-user-id',
      tenantId: 'test-tenant-id',
      voteType: 'up' as const
    };
    
    const result = await voteOnAgentVersion(
      voteData.agentVersionId,
      voteData.voteType,
      voteData.userId,
      voteData.tenantId
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
