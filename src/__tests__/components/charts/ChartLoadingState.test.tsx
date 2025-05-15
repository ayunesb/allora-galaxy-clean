
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartLoadingState from '@/components/admin/errors/charts/ChartLoadingState';

describe('ChartLoadingState', () => {
  it('renders loading skeleton', () => {
    const { getByTestId } = render(<ChartLoadingState />);
    expect(getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    const { getByTestId } = render(<ChartLoadingState height={400} />);
    const skeleton = getByTestId('chart-skeleton');
    expect(skeleton.style.height).toBe('400px');
  });
});
