
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Analyze Prompt Diff Edge Function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call the edge function with the correct parameters', async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        diff_summary: 'Added context processing instructions',
        impact_rationale: 'This change will improve response quality',
        raw_diff: [
          { added: false, removed: false, value: 'Common text' },
          { added: true, removed: false, value: 'New instruction' },
          { added: false, removed: true, value: 'Old instruction' }
        ]
      },
      error: null
    };

    (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

    // Test data
    const testData = {
      current_prompt: 'This is the current prompt with new instruction',
      previous_prompt: 'This is the previous prompt with old instruction',
      plugin_id: 'test-plugin-id',
      agent_version_id: 'test-agent-version-id'
    };

    // Call the edge function
    const result = await supabase.functions.invoke('analyzePromptDiff', {
      body: testData
    });

    // Verify the function was called with the correct data
    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyzePromptDiff', {
      body: testData
    });

    // Verify response
    expect(result).toEqual(mockResponse);
    expect(result.data.diff_summary).toBe('Added context processing instructions');
    expect(result.data.impact_rationale).toBe('This change will improve response quality');
    expect(result.data.raw_diff).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    const mockErrorResponse = {
      data: null,
      error: {
        message: 'Failed to analyze prompt diff'
      }
    };

    (supabase.functions.invoke as any).mockResolvedValue(mockErrorResponse);

    // Call the edge function
    const result = await supabase.functions.invoke('analyzePromptDiff', {
      body: {
        current_prompt: 'Test current',
        previous_prompt: 'Test previous'
      }
    });

    // Verify error handling
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe('Failed to analyze prompt diff');
  });
});
