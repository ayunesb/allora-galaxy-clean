
import { describe, it, expect, vi } from 'vitest';

// Mock before top-level imports
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      insert: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { upvotes: 5, downvotes: 2 }, 
        error: null 
      }),
    }),
  },
}));

import { voteOnAgentVersion } from '@/lib/agents/vote';

describe('Agent Voting', () => {
  it('should vote successfully', async () => {
    const result = await voteOnAgentVersion(
      'test-agent',
      'up',
      'test-user'
    );
    
    expect(result.success).toBe(true);
    expect(result.upvotes).toBe(5);
    expect(result.downvotes).toBe(2);
  });
});
