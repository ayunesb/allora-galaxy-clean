
// Fix the error by removing the unused options variable
import { describe, it, expect, vi } from 'vitest';
import { autoEvolveAgents } from '@/lib/agents/evolution/autoEvolveAgents';
import { checkEvolutionNeeded } from '@/lib/agents/evolution/checkEvolutionNeeded';
import { createEvolvedAgent } from '@/lib/agents/evolution/createEvolvedAgent';
import { deactivateOldAgent } from '@/lib/agents/evolution/deactivateOldAgent';

// Mock the dependencies
vi.mock('@/lib/agents/evolution/checkEvolutionNeeded', () => ({
  checkEvolutionNeeded: vi.fn()
}));

vi.mock('@/lib/agents/evolution/createEvolvedAgent', () => ({
  createEvolvedAgent: vi.fn()
}));

vi.mock('@/lib/agents/evolution/deactivateOldAgent', () => ({
  deactivateOldAgent: vi.fn()
}));

describe('autoEvolveAgents', () => {
  it('should evolve agents that need evolution', async () => {
    // Mock agent that needs evolution
    const mockAgents = [
      { id: 'agent1', version: '1.0', prompt: 'Original prompt' },
      { id: 'agent2', version: '1.0', prompt: 'Another prompt' }
    ];
    
    // Setup mocks
    vi.mocked(checkEvolutionNeeded).mockResolvedValueOnce(true);
    vi.mocked(checkEvolutionNeeded).mockResolvedValueOnce(false);
    
    vi.mocked(createEvolvedAgent).mockResolvedValueOnce({
      id: 'evolved-agent1',
      version: '2.0',
      prompt: 'Improved prompt',
      success: true
    });
    
    vi.mocked(deactivateOldAgent).mockResolvedValueOnce(true);
    
    // Execute the function
    const result = await autoEvolveAgents(mockAgents, 'tenant-123');
    
    // Verify the results
    expect(result.evolved).toBe(1);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].success).toBe(true);
    expect(result.results[1].success).toBe(false);
    expect(result.results[1].reason).toContain('No evolution needed');
    
    // Verify functions were called as expected
    expect(checkEvolutionNeeded).toHaveBeenCalledTimes(2);
    expect(createEvolvedAgent).toHaveBeenCalledTimes(1);
    expect(deactivateOldAgent).toHaveBeenCalledTimes(1);
  });
  
  it('should handle errors during evolution', async () => {
    // Mock agents
    const mockAgents = [
      { id: 'agent3', version: '1.0', prompt: 'Original prompt' }
    ];
    
    // Setup mocks to simulate failure
    vi.mocked(checkEvolutionNeeded).mockResolvedValueOnce(true);
    vi.mocked(createEvolvedAgent).mockRejectedValueOnce(new Error('Evolution failed'));
    
    // Execute the function
    const result = await autoEvolveAgents(mockAgents, 'tenant-123');
    
    // Verify the results
    expect(result.evolved).toBe(0);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].success).toBe(false);
    expect(result.results[0].error).toContain('Evolution failed');
  });
});
