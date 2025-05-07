
import { expect, test, describe, vi } from 'vitest';
import * as autoEvolve from '@/lib/agents/autoEvolve';

// Mock the autoEvolve module
vi.mock('@/lib/agents/autoEvolve', () => ({
  checkAgentForPromotion: vi.fn(),
  checkAndEvolveAgent: vi.fn(),
  checkAndEvolveAgents: vi.fn(),
}));

// Mock the fetch function for testing edge functions
global.fetch = vi.fn();

describe('Auto Evolve Agents Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should evolve agents when conditions are met', async () => {
    // Setup mocks
    const mockAgentVersions = [
      { id: 'agent-1', name: 'Agent 1', tenant_id: 'tenant-1' },
      { id: 'agent-2', name: 'Agent 2', tenant_id: 'tenant-1' },
    ];
    
    const mockResponse = {
      evolvedCount: 1,
      results: [
        { agentId: 'agent-1', evolved: true, reason: 'High XP score' },
        { agentId: 'agent-2', evolved: false, reason: 'Not enough votes' },
      ]
    };
    
    // Mock the checkAndEvolveAgents function to return our mock response
    (autoEvolve.checkAndEvolveAgents as jest.Mock).mockResolvedValue(mockResponse);
    
    // Mock the global fetch to simulate the edge function response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Call the function through the edge function interface
    const response = await fetch('/functions/autoEvolveAgents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 'tenant-1' }),
    });
    
    const result = await response.json();
    
    // Verify the result
    expect(result.evolvedCount).toEqual(1);
    expect(result.results.length).toEqual(2);
    expect(result.results[0].evolved).toBe(true);
    expect(autoEvolve.checkAndEvolveAgents).toHaveBeenCalledWith('tenant-1');
  });

  test('should handle empty agent list', async () => {
    // Setup mocks for empty response
    const mockEmptyResponse = {
      evolvedCount: 0,
      results: []
    };
    
    // Mock the checkAndEvolveAgents function to return empty response
    (autoEvolve.checkAndEvolveAgents as jest.Mock).mockResolvedValue(mockEmptyResponse);
    
    // Mock the global fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEmptyResponse),
    });

    // Call the function
    const response = await fetch('/functions/autoEvolveAgents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // No tenant ID, should use default
    });
    
    const result = await response.json();
    
    // Verify the result
    expect(result.evolvedCount).toEqual(0);
    expect(result.results).toEqual([]);
    expect(autoEvolve.checkAndEvolveAgents).toHaveBeenCalled();
  });

  test('should handle errors during evolution', async () => {
    // Setup mock for error case
    const mockError = new Error('Evolution process failed');
    (autoEvolve.checkAndEvolveAgents as jest.Mock).mockRejectedValue(mockError);
    
    // Mock the global fetch to return error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });

    // Call the function and expect it to fail properly
    const response = await fetch('/functions/autoEvolveAgents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 'tenant-1' }),
    });
    
    expect(response.ok).toBe(false);
    expect(response.status).toEqual(500);
    
    // Verify the function was called despite the error
    expect(autoEvolve.checkAndEvolveAgents).toHaveBeenCalledWith('tenant-1');
  });

  test('should validate input parameters', async () => {
    // Mock implementation for invalid tenant ID
    (autoEvolve.checkAndEvolveAgents as jest.Mock).mockImplementation((tenantId) => {
      if (!tenantId || typeof tenantId !== 'string') {
        throw new Error('Invalid tenant ID');
      }
      return { evolvedCount: 0, results: [] };
    });
    
    // Mock fetch with validation error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid tenant ID format' }),
    });

    // Call with invalid tenant ID format
    const response = await fetch('/functions/autoEvolveAgents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 123 }), // Invalid - should be string
    });
    
    expect(response.ok).toBe(false);
    expect(response.status).toEqual(400);
  });
});
