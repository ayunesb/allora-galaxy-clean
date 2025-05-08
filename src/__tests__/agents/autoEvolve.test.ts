
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { calculateAgentPerformance } from '@/lib/agents/evolution/calculatePerformance';
import { evolvePromptWithFeedback } from '@/lib/agents/evolution/evolvePromptWithFeedback';
import { getFeedbackComments } from '@/lib/agents/evolution/getFeedbackComments';
import { getAgentUsageStats } from '@/lib/agents/evolution/getAgentUsageStats';

// Mock dependencies
vi.mock('@/lib/agents/evolution/calculatePerformance');
vi.mock('@/lib/agents/evolution/evolvePromptWithFeedback');
vi.mock('@/lib/agents/evolution/getFeedbackComments');
vi.mock('@/lib/agents/evolution/getAgentUsageStats');
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }
}));

describe('Auto-evolve agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(calculateAgentPerformance).mockResolvedValue(0.5);
    vi.mocked(evolvePromptWithFeedback).mockResolvedValue('Evolved prompt');
    vi.mocked(getFeedbackComments).mockResolvedValue([
      { vote_type: 'up', comment: 'Good' },
      { vote_type: 'down', comment: 'Bad' }
    ]);
    vi.mocked(getAgentUsageStats).mockResolvedValue([
      { status: 'success', count: 10 },
      { status: 'failure', count: 5 }
    ]);
    
    // Mock supabase query chain
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.update.mockResolvedValue({ error: null });
    supabase.insert.mockReturnThis();
    supabase.single.mockResolvedValue({ 
      data: { id: 'new-agent-1', version: '1.1.0' },
      error: null
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should evolve agent when performance is below threshold', async () => {
    // Arrange
    const mockAgents = [
      {
        id: 'agent-1',
        version: '1.0.0',
        prompt: 'Original prompt',
        status: 'active',
        plugin_id: 'plugin-1',
        created_by: 'user-1'
      }
    ];
    
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.eq.mockReturnValue({
      data: mockAgents,
      error: null
    });
    
    vi.mocked(calculateAgentPerformance).mockResolvedValue(0.2); // Below threshold
    
    // Act
    const results = await autoEvolveAgents({
      tenantId: 'tenant-1',
      threshold: 0.3
    });
    
    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].agentId).toBe('agent-1');
    expect(results[0].evolved).toBe(true);
    expect(results[0].success).toBe(true);
    expect(evolvePromptWithFeedback).toHaveBeenCalledTimes(1);
  });
  
  it('should not evolve agent when performance is above threshold', async () => {
    // Arrange
    const mockAgents = [
      {
        id: 'agent-1',
        version: '1.0.0',
        prompt: 'Original prompt',
        status: 'active',
        plugin_id: 'plugin-1',
        created_by: 'user-1'
      }
    ];
    
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.eq.mockReturnValue({
      data: mockAgents,
      error: null
    });
    
    vi.mocked(calculateAgentPerformance).mockResolvedValue(0.8); // Above threshold
    
    // Act
    const results = await autoEvolveAgents({
      tenantId: 'tenant-1',
      threshold: 0.3
    });
    
    // Assert
    expect(results).toHaveLength(0);
    expect(evolvePromptWithFeedback).not.toHaveBeenCalled();
  });
  
  it('should skip agents without feedback when requireFeedback is true', async () => {
    // Arrange
    const mockAgents = [
      {
        id: 'agent-1',
        version: '1.0.0',
        prompt: 'Original prompt',
        status: 'active',
        plugin_id: 'plugin-1',
        created_by: 'user-1'
      }
    ];
    
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.eq.mockReturnValue({
      data: mockAgents,
      error: null
    });
    
    vi.mocked(getFeedbackComments).mockResolvedValue([]);
    
    // Act
    const results = await autoEvolveAgents({
      tenantId: 'tenant-1',
      requireFeedback: true
    });
    
    // Assert
    expect(results).toHaveLength(0);
    expect(calculateAgentPerformance).not.toHaveBeenCalled();
  });
  
  it('should only perform dry run when dryRun is true', async () => {
    // Arrange
    const mockAgents = [
      {
        id: 'agent-1',
        version: '1.0.0',
        prompt: 'Original prompt',
        status: 'active',
        plugin_id: 'plugin-1',
        created_by: 'user-1'
      }
    ];
    
    const supabase = require('@/integrations/supabase/client').supabase;
    supabase.eq.mockReturnValue({
      data: mockAgents,
      error: null
    });
    
    vi.mocked(calculateAgentPerformance).mockResolvedValue(0.2); // Below threshold
    
    // Act
    const results = await autoEvolveAgents({
      tenantId: 'tenant-1',
      dryRun: true
    });
    
    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].evolved).toBe(false);
    expect(evolvePromptWithFeedback).not.toHaveBeenCalled();
    expect(supabase.insert).not.toHaveBeenCalled();
  });
});
