
import { vi, describe, it, expect, beforeEach, Mock, type Procedure } from 'vitest';
import { voteOnAgentVersion } from '@/lib/agents/vote';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(callback => callback({ data: [], error: null }))
    })
  }
}));

// Mock the system log function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true })
}));

describe('Agent Voting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit an upvote successfully', async () => {
    // Mock the supabase client for this test
    const mockSupabase = await import('@/integrations/supabase/client');
    
    // Create a typed mock function
    const mockFromFn = vi.fn().mockImplementation((table: string) => {
      if (table === 'agent_votes') {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockResolvedValue({ data: { id: 'vote123' }, error: null }),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          match: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          upsert: vi.fn(),
        };
      }
      
      if (table === 'agent_versions') {
        return {
          select: vi.fn().mockResolvedValue({ data: { upvotes: 10, downvotes: 5 }, error: null }),
          update: vi.fn().mockResolvedValue({ data: { id: 'agent123' }, error: null }),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
          match: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          upsert: vi.fn(),
        };
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        upsert: vi.fn(),
      };
    });
    
    // Replace the mockSupabase.supabase.from with our mock implementation
    vi.spyOn(mockSupabase.supabase, 'from').mockImplementation(mockFromFn as unknown as any);
    
    // Act
    const result = await voteOnAgentVersion(
      'agent123',
      'upvote',
      'user123',
      'tenant123',
      'Great job!'
    );
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.upvotes).toBeGreaterThan(0);
    expect(mockSupabase.supabase.from).toHaveBeenCalledWith('agent_votes');
    expect(mockSupabase.supabase.from).toHaveBeenCalledWith('agent_versions');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock the supabase client for this test
    const mockSupabase = await import('@/integrations/supabase/client');
    
    // Create a mock function that simulates error
    const mockFromWithError = vi.fn().mockImplementation(() => {
      return {
        select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        upsert: vi.fn(),
      };
    });
    
    // Replace the mockSupabase.supabase.from with our error mock implementation
    vi.spyOn(mockSupabase.supabase, 'from').mockImplementation(mockFromWithError as unknown as any);
    
    // Act
    const result = await voteOnAgentVersion(
      'agent123',
      'upvote',
      'user123',
      'tenant123'
    );
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
