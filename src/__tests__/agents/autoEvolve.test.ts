
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { autoEvolveAgents, evolveAgentByVotes, checkAndEvolveAgent, AutoEvolveOptions } from '@/lib/agents/autoEvolve';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => ({
        data: { 
          id: 'agent1',
          tenant_id: 'tenant1',
          plugin_id: 'plugin1',
          status: 'active',
          version: '1.0',
          xp: 150,
          upvotes: 10,
          plugins: { id: 'plugin1', name: 'Test Plugin' }
        },
        error: null
      })),
      maybeSingle: vi.fn().mockImplementation(() => ({
        data: { 
          id: 'agent1',
          tenant_id: 'tenant1',
          plugin_id: 'plugin1',
          status: 'active',
          version: '1.0',
          xp: 150,
          upvotes: 10,
          plugins: { id: 'plugin1', name: 'Test Plugin' }
        },
        error: null
      }))
    })),
  },
}));

vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue('log1')
}));

describe('Auto Evolve Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should check if an agent is ready to evolve', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'agent1',
      tenant_id: 'tenant1',
      min_xp_threshold: 100,
      min_upvotes: 5,
      notify_users: true
    };
    
    // Mock that no next versions exist
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().gt().order().limit.mockImplementationOnce(() => ({
      data: [],
      error: null
    }));
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.evolved).toBe(false);
    expect(result.requires_approval).toBe(true);
    expect(logSystemEvent).toHaveBeenCalled();
  });
  
  it('should evolve an agent to the next version when available', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'agent1',
      tenant_id: 'tenant1',
      min_xp_threshold: 100,
      min_upvotes: 5
    };
    
    // Mock that next version exists
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().gt().order().limit.mockImplementationOnce(() => ({
      data: [{ id: 'agent2', version: '1.1', status: 'inactive' }],
      error: null
    }));
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.evolved).toBe(true);
    expect(result.new_version_id).toBe('agent2');
    expect(logSystemEvent).toHaveBeenCalled();
  });
  
  it('should not evolve if XP threshold is not met', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'agent1',
      tenant_id: 'tenant1',
      min_xp_threshold: 200, // Higher than the agent's XP
      min_upvotes: 5
    };
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.evolved).toBe(false);
    expect(result.message).toContain("hasn't reached XP threshold");
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should not evolve if upvote threshold is not met', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'agent1',
      tenant_id: 'tenant1',
      min_xp_threshold: 100,
      min_upvotes: 20 // Higher than the agent's upvotes
    };
    
    // Override the mock to have low upvotes
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().maybeSingle.mockImplementationOnce(() => ({
      data: { 
        id: 'agent1',
        tenant_id: 'tenant1',
        plugin_id: 'plugin1',
        status: 'active',
        version: '1.0',
        xp: 150,
        upvotes: 5, // Not enough upvotes
        plugins: { id: 'plugin1', name: 'Test Plugin' }
      },
      error: null
    }));
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.evolved).toBe(false);
    expect(result.message).toContain("hasn't reached upvote threshold");
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should handle agent version not found', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'nonexistent',
      tenant_id: 'tenant1'
    };
    
    // Mock not found response
    const supabaseMock = require('@/integrations/supabase/client').supabase;
    supabaseMock.from().select().eq().maybeSingle.mockImplementationOnce(() => ({
      data: null,
      error: { message: 'Agent version not found' }
    }));
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Agent version not found');
    expect(logSystemEvent).toHaveBeenCalled();
  });
  
  it('should handle tenant access denied', async () => {
    // Arrange
    const options: AutoEvolveOptions = {
      agent_version_id: 'agent1',
      tenant_id: 'tenant2' // Different from agent's tenant_id
    };
    
    // Act
    const result = await checkAndEvolveAgent(options);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Agent version does not belong to the specified tenant');
    expect(logSystemEvent).toHaveBeenCalled();
  });
});
