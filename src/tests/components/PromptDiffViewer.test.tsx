
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PromptDiffViewer from '@/components/PromptDiffViewer';

describe('PromptDiffViewer Component', () => {
  it('renders with no props', () => {
    render(<PromptDiffViewer oldPrompt="" newPrompt="" />);
    // Should render an empty diff section
    const diffElement = screen.getByRole('region');
    expect(diffElement).toBeDefined();
  });

  it('displays added text in green', () => {
    const oldPrompt = "This is the old text.";
    const newPrompt = "This is the old text. And this is added.";

    const { container } = render(
      <PromptDiffViewer oldPrompt={oldPrompt} newPrompt={newPrompt} />
    );
    
    // Check for the green highlighting for added text
    const addedTextElement = container.querySelector('.bg-green-100');
    expect(addedTextElement).toBeDefined();
    expect(addedTextElement?.textContent).toContain('+ ');
    expect(addedTextElement?.textContent).toContain('And this is added');
  });

  it('displays removed text in red', () => {
    const oldPrompt = "This is the old text with something to remove.";
    const newPrompt = "This is the old text.";

    const { container } = render(
      <PromptDiffViewer oldPrompt={oldPrompt} newPrompt={newPrompt} />
    );
    
    // Check for the red highlighting for removed text
    const removedTextElement = container.querySelector('.bg-red-100');
    expect(removedTextElement).toBeDefined();
    expect(removedTextElement?.textContent).toContain('- ');
    expect(removedTextElement?.textContent).toContain('with something to remove');
  });

  it('handles large diffs appropriately', () => {
    const oldPrompt = "A\n".repeat(500);
    const newPrompt = "B\n".repeat(500);

    const { container } = render(
      <PromptDiffViewer oldPrompt={oldPrompt} newPrompt={newPrompt} />
    );
    
    // Should still render without crashing
    const diffElement = container.querySelector('.font-mono');
    expect(diffElement).toBeDefined();
    
    // There should be many diff elements
    const diffItems = container.querySelectorAll('pre');
    expect(diffItems.length).toBeGreaterThan(0);
  });
});
