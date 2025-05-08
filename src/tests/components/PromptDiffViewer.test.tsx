
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PromptDiffViewer from '@/components/PromptDiffViewer';

describe('PromptDiffViewer', () => {
  test('renders diff view correctly', () => {
    const oldPrompt = 'This is the old prompt text';
    const newPrompt = 'This is the new prompt text';
    
    render(<PromptDiffViewer oldPrompt={oldPrompt} newPrompt={newPrompt} />);
    
    expect(screen.getByText(/old prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/new prompt/i)).toBeInTheDocument();
  });
});
