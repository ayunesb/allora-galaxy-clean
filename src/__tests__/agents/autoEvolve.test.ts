
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAgentForPromotion, checkAndEvolveAgent } from '@/lib/agents/autoEvolve';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { 
          id: 'test-agent-version-id',
          version: '1.0',
          status: 'training',
          xp: 1000,
          upvotes: 10,
          plugin_id: 'test-plugin-id',
          plugins: {
            name: 'Test Plugin',
            id: 'test-plugin-id'
          }
        }, 
        error: null 
      })
    }))
  }
}));

// Mock logSystemEvent
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

describe('Agent Evolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAgentForPromotion', () => {
    it('should check if an agent is ready for promotion', async () => {
      const result = await checkAgentForPromotion('test-agent-version-id');
      
      expect(result).toEqual({
        success: true,
        agent: expect.objectContaining({
          id: 'test-agent-version-id',
          xp: 1000,
          upvotes: 10
        }),
        ready_for_promotion: true,
        current_xp: 1000,
        current_upvotes: 10,
        requires_approval: true
      });
    });
  });

  describe('checkAndEvolveAgent', () => {
    it('should check and evolve an agent', async () => {
      const result = await checkAndEvolveAgent({
        agent_version_id: 'test-agent-version-id',
        tenant_id: 'test-tenant-id',
        min_xp_threshold: 500,
        min_upvotes: 5
      });
      
      expect(result.success).toBe(true);
    });
  });
});
