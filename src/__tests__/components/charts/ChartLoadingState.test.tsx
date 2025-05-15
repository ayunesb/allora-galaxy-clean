
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartLoadingState } from '@/components/admin/errors/charts/ChartLoadingState';

describe('ChartLoadingState', () => {
  it('renders the loading skeleton with default height', () => {
    render(<ChartLoadingState />);
    const skeleton = screen.getByTestId('chart-loading');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders the loading skeleton with custom height', () => {
    const customHeight = 400;
    render(<ChartLoadingState height={customHeight} />);
    const skeleton = screen.getByTestId('chart-loading');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle(`height: ${customHeight}px`);
  });
});
