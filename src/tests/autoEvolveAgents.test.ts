
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { checkAgentForPromotion, checkAndEvolveAgent } from '@/lib/agents/autoEvolve';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-agent-id',
          plugin_id: 'test-plugin-id',
          version: '1.0',
          status: 'training',
          xp: 1200,
          upvotes: 8,
          downvotes: 1,
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

// Mock system event logging
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));

describe('Agent Evolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up the mock responses for different test cases
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'agent_versions') {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          neq: vi.fn().mockReturnThis(),
          gt: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          }),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-agent-id',
              plugin_id: 'test-plugin-id',
              version: '1.0',
              status: 'training',
              xp: 1200,
              upvotes: 8,
              downvotes: 1,
              plugins: {
                name: 'Test Plugin',
                id: 'test-plugin-id'
              }
            },
            error: null
          })
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      } as any;
    });
  });

  describe('checkAgentForPromotion', () => {
    it('should check if an agent is ready for promotion when thresholds are met', async () => {
      const result = await checkAgentForPromotion('test-agent-id');
      
      expect(result).toEqual({
        success: true,
        agent: expect.objectContaining({
          id: 'test-agent-id',
          xp: 1200,
          upvotes: 8
        }),
        ready_for_promotion: true,
        current_xp: 1200,
        current_upvotes: 8,
        requires_approval: true
      });
    });
    
    it('should return not ready when agent XP is below threshold', async () => {
      // Override the mock for this specific test
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-agent-id',
            plugin_id: 'test-plugin-id',
            version: '1.0',
            status: 'training',
            xp: 500, // Below threshold
            upvotes: 8,
            plugins: {
              name: 'Test Plugin',
              id: 'test-plugin-id'
            }
          },
          error: null
        })
      } as any));
      
      const result = await checkAgentForPromotion('test-agent-id');
      
      expect(result.ready_for_promotion).toBe(false);
      expect(result.current_xp).toBe(500);
    });
    
    it('should return not ready when agent upvotes are below threshold', async () => {
      // Override the mock for this specific test
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-agent-id',
            plugin_id: 'test-plugin-id',
            version: '1.0',
            status: 'training',
            xp: 1200, 
            upvotes: 3, // Below threshold
            plugins: {
              name: 'Test Plugin',
              id: 'test-plugin-id'
            }
          },
          error: null
        })
      } as any));
      
      const result = await checkAgentForPromotion('test-agent-id');
      
      expect(result.ready_for_promotion).toBe(false);
      expect(result.current_upvotes).toBe(3);
    });
    
    it('should handle errors gracefully', async () => {
      // Override the mock to simulate an error
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Agent version not found'
          }
        })
      } as any));
      
      const result = await checkAgentForPromotion('nonexistent-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.ready_for_promotion).toBe(false);
    });
  });

  describe('checkAndEvolveAgent', () => {
    it('should evolve an agent that meets the criteria when approval not required', async () => {
      // Setup mock implementation for successful evolution
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'agent_versions') {
          return {
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-agent-id',
                plugin_id: 'test-plugin-id',
                version: '1.0',
                status: 'training',
                xp: 1200,
                upvotes: 8,
                plugins: {
                  name: 'Test Plugin',
                  id: 'test-plugin-id'
                }
              },
              error: null
            })
          } as any;
        } else if (table === 'system_logs') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: { id: 'log-id' },
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        } as any;
      });
      
      const result = await checkAndEvolveAgent({
        agent_version_id: 'test-agent-id',
        tenant_id: 'test-tenant-id',
        min_xp_threshold: 1000,
        min_upvotes: 5,
        requires_approval: false // No approval required
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Agent successfully promoted');
    });
    
    it('should not evolve an agent when approval is required', async () => {
      const result = await checkAndEvolveAgent({
        agent_version_id: 'test-agent-id',
        tenant_id: 'test-tenant-id',
        min_xp_threshold: 1000,
        min_upvotes: 5,
        requires_approval: true // Approval required
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('requires approval');
      expect(result.needs_approval).toBe(true);
    });
    
    it('should not evolve an agent that does not meet criteria', async () => {
      // Override the mock for this specific test
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-agent-id',
            plugin_id: 'test-plugin-id',
            version: '1.0',
            status: 'training',
            xp: 500, // Below threshold
            upvotes: 3, // Below threshold
            plugins: {
              name: 'Test Plugin',
              id: 'test-plugin-id'
            }
          },
          error: null
        })
      } as any));
      
      const result = await checkAndEvolveAgent({
        agent_version_id: 'test-agent-id',
        tenant_id: 'test-tenant-id',
        min_xp_threshold: 1000,
        min_upvotes: 5
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('does not meet promotion criteria');
    });
    
    it('should handle database errors gracefully', async () => {
      // Override the mock to simulate an error
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Database error'
          }
        })
      } as any));
      
      const result = await checkAndEvolveAgent({
        agent_version_id: 'invalid-id',
        tenant_id: 'test-tenant-id'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
