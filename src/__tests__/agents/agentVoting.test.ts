
import { describe, it, expect, vi } from 'vitest';

// Mock before top-level imports
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      insert: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    }),
  },
}));

import { voteOnAgentVersion } from '@/lib/agents/vote';

describe('Agent Voting', () => {
  it('should vote successfully', async () => {
    const result = await voteOnAgentVersion({
      agent_version_id: 'test-agent',
      user_id: 'test-user',
      vote_type: 'up',
    });
    
    expect(result.success).toBe(true);
  });
});
