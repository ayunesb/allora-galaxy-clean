
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PromptDiffViewer from '@/components/PromptDiffViewer';

describe('PromptDiffViewer', () => {
  test('renders diff view correctly', () => {
    const oldPrompt = 'This is the old prompt text';
    const newPrompt = 'This is the new prompt text';
    
    const { getByText } = render(<PromptDiffViewer oldPrompt={oldPrompt} newPrompt={newPrompt} />);
    
    expect(getByText(/old prompt/i)).toBeTruthy();
    expect(getByText(/new prompt/i)).toBeTruthy();
  });
});
