
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evolvePromptWithFeedback } from '../../lib/agents/evolution/evolvePromptWithFeedback';

// Mock the date to ensure consistent output
const mockDate = new Date('2025-05-01');
vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

describe('Agent Evolution', () => {
  let originalPrompt: string;
  
  beforeEach(() => {
    originalPrompt = "This is the original agent prompt. It needs improvement.";
  });
  
  it('should incorporate feedback into evolved prompt', async () => {
    const feedbackComments = [
      { 
        vote_type: 'up', 
        comment: 'Good structure overall',
        created_at: '2025-04-30T00:00:00Z'
      },
      { 
        vote_type: 'down', 
        comment: 'Needs more examples',
        created_at: '2025-04-30T00:00:00Z'
      }
    ];
    
    const evolveReason = 'Regular improvement';
    
    const evolvedPrompt = await evolvePromptWithFeedback(
      originalPrompt,
      feedbackComments,
      evolveReason
    );
    
    // Verify that the evolved prompt contains the essential components
    expect(evolvedPrompt).toContain('# Evolved Agent Prompt v2025-05-01');
    expect(evolvedPrompt).toContain('# Evolution reason: Regular improvement');
    expect(evolvedPrompt).toContain('# Based on 2 feedback comments (1 positive, 1 negative)');
    expect(evolvedPrompt).toContain(originalPrompt);
    expect(evolvedPrompt).toContain('Good structure overall');
    expect(evolvedPrompt).toContain('Needs more examples');
  });
  
  it('should handle empty feedback gracefully', async () => {
    const feedbackComments: Array<{
      comment: string;
      vote_type: string;
      created_at: string;
    }> = [];
    
    const evolveReason = 'Scheduled evolution';
    
    const evolvedPrompt = await evolvePromptWithFeedback(
      originalPrompt,
      feedbackComments,
      evolveReason
    );
    
    // Verify that the evolved prompt contains the essential components
    expect(evolvedPrompt).toContain('# Evolved Agent Prompt v2025-05-01');
    expect(evolvedPrompt).toContain('# Evolution reason: Scheduled evolution');
    expect(evolvedPrompt).toContain('# Based on 0 feedback comments (0 positive, 0 negative)');
    expect(evolvedPrompt).toContain(originalPrompt);
    expect(evolvedPrompt).toContain('## No positive feedback provided');
    expect(evolvedPrompt).toContain('## No negative feedback provided');
  });
  
  it('should gracefully handle errors and return original prompt', async () => {
    // Create a malformed feedback object to trigger an error
    const feedbackComments = [{ 
      vote_type: 'invalid',
      comment: null as any,
      created_at: '2025-04-30T00:00:00Z'
    }];
    
    const evolveReason = 'Error test';
    
    // Mock console.error to prevent test output clutter
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const evolvedPrompt = await evolvePromptWithFeedback(
      originalPrompt,
      feedbackComments,
      evolveReason
    );
    
    // Should return the original prompt on error
    expect(evolvedPrompt).toBe(originalPrompt);
    expect(consoleErrorMock).toHaveBeenCalled();
    
    // Clean up
    consoleErrorMock.mockRestore();
  });
});
