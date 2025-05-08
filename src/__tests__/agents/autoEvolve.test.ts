
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { getAgentsForEvolution } from '@/lib/agents/evolution/getAgentsForEvolution';
import { calculateAgentPerformance } from '@/lib/agents/evolution/calculatePerformance';
import { createEvolvedAgent } from '@/lib/agents/evolution/createEvolvedAgent';
import { deactivateAgent } from '@/lib/agents/evolution/deactivateOldAgent';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock the imported functions
vi.mock('@/lib/agents/evolution/getAgentsForEvolution');
vi.mock('@/lib/agents/evolution/calculatePerformance');
vi.mock('@/lib/agents/evolution/createEvolvedAgent');
vi.mock('@/lib/agents/evolution/deactivateOldAgent');
vi.mock('@/lib/system/logSystemEvent');

describe('autoEvolveAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return early if no agents need evolution', async () => {
    // Mock getAgentsForEvolution to return an empty array
    vi.mocked(getAgentsForEvolution).mockResolvedValueOnce([]);
    
    const result = await autoEvolveAgents();
    
    expect(result.evolved).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(result.message).toContain('No agents found that need evolution');
    expect(getAgentsForEvolution).toHaveBeenCalledTimes(1);
    expect(calculateAgentPerformance).not.toHaveBeenCalled();
    expect(createEvolvedAgent).not.toHaveBeenCalled();
    expect(deactivateAgent).not.toHaveBeenCalled();
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should skip agents that do not need evolution', async () => {
    // Mock agent that doesn't need evolution
    vi.mocked(getAgentsForEvolution).mockResolvedValueOnce([
      { id: 'agent1', plugin_id: 'plugin1', version: '1.0' }
    ]);
    
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: false,
      evolveReason: null,
      metrics: { xp: 100, upvotes: 10, downvotes: 2 }
    });
    
    const result = await autoEvolveAgents();
    
    expect(result.evolved).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors).toBe(0);
    expect(calculateAgentPerformance).toHaveBeenCalledWith('agent1');
    expect(createEvolvedAgent).not.toHaveBeenCalled();
    expect(deactivateAgent).not.toHaveBeenCalled();
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should evolve agents successfully', async () => {
    // Mock agent that needs evolution
    vi.mocked(getAgentsForEvolution).mockResolvedValueOnce([
      { id: 'agent2', plugin_id: 'plugin2', version: '1.0' }
    ]);
    
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: true,
      evolveReason: 'Poor performance',
      metrics: { xp: 50, upvotes: 2, downvotes: 8 }
    });
    
    vi.mocked(createEvolvedAgent).mockResolvedValueOnce({
      id: 'evolved-agent-id',
      version: '1.1'
    });
    
    const result = await autoEvolveAgents();
    
    expect(result.evolved).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(calculateAgentPerformance).toHaveBeenCalledWith('agent2');
    expect(createEvolvedAgent).toHaveBeenCalledWith(
      'agent2', 
      'plugin2', 
      expect.objectContaining({ 
        shouldEvolve: true, 
        evolveReason: 'Poor performance'
      })
    );
    expect(deactivateAgent).toHaveBeenCalledWith('agent2');
    expect(logSystemEvent).toHaveBeenCalledWith(
      'system', 
      'agent', 
      'agent_evolved', 
      expect.objectContaining({
        old_agent_id: 'agent2',
        new_agent_id: 'evolved-agent-id'
      })
    );
  });
  
  it('should handle errors during evolution', async () => {
    // Mock agent where evolution fails
    vi.mocked(getAgentsForEvolution).mockResolvedValueOnce([
      { id: 'agent3', plugin_id: 'plugin3', version: '1.0' }
    ]);
    
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: true,
      evolveReason: 'Poor performance',
      metrics: { xp: 50, upvotes: 2, downvotes: 8 }
    });
    
    vi.mocked(createEvolvedAgent).mockResolvedValueOnce(null);
    
    const result = await autoEvolveAgents();
    
    expect(result.evolved).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(1);
    expect(result.details[0].status).toBe('error');
    expect(result.details[0].reason).toContain('Failed to create evolved agent');
    expect(deactivateAgent).not.toHaveBeenCalled();
    expect(logSystemEvent).not.toHaveBeenCalled();
  });
  
  it('should handle multiple agents with mixed results', async () => {
    // Mock multiple agents with different outcomes
    vi.mocked(getAgentsForEvolution).mockResolvedValueOnce([
      { id: 'agent4', plugin_id: 'plugin4', version: '1.0' },
      { id: 'agent5', plugin_id: 'plugin5', version: '1.0' },
      { id: 'agent6', plugin_id: 'plugin6', version: '1.0' }
    ]);
    
    // First agent should evolve
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: true,
      evolveReason: 'Poor performance',
      metrics: { xp: 40, upvotes: 1, downvotes: 9 }
    });
    
    // Second agent should skip
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: false,
      evolveReason: null,
      metrics: { xp: 90, upvotes: 9, downvotes: 1 }
    });
    
    // Third agent should error
    vi.mocked(calculateAgentPerformance).mockResolvedValueOnce({
      shouldEvolve: true,
      evolveReason: 'Low engagement',
      metrics: { xp: 30, upvotes: 2, downvotes: 6 }
    });
    
    // First agent evolution succeeds
    vi.mocked(createEvolvedAgent).mockResolvedValueOnce({
      id: 'evolved-agent4',
      version: '1.1'
    });
    
    // Third agent evolution fails
    vi.mocked(createEvolvedAgent).mockResolvedValueOnce(null);
    
    const result = await autoEvolveAgents();
    
    expect(result.evolved).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors).toBe(1);
    expect(result.details).toHaveLength(3);
    expect(result.details[0].status).toBe('evolved');
    expect(result.details[1].status).toBe('skipped');
    expect(result.details[2].status).toBe('error');
  });
  
  it('should handle unexpected errors', async () => {
    // Mock a function that throws an error
    vi.mocked(getAgentsForEvolution).mockRejectedValueOnce(new Error('Database connection failed'));
    
    const result = await autoEvolveAgents();
    
    expect(result.message).toContain('Failed to complete evolution process');
    expect(result.message).toContain('Database connection failed');
    expect(result.evolved).toBe(0);
    expect(result.errors).toBe(0);
    expect(result.skipped).toBe(0);
  });
});
