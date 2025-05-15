
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartLoadingState from '@/components/admin/errors/charts/ChartLoadingState';

// Mock skeleton component
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className}></div>
  )
}));

describe('ChartLoadingState', () => {
  it('renders with default height', () => {
    const { getByTestId } = render(<ChartLoadingState />);
    const loadingState = getByTestId('chart-loading-state');
    expect(loadingState).toBeInTheDocument();
    expect(loadingState.style.height).toBe('200px');
  });

  it('renders with custom height', () => {
    const { getByTestId } = render(<ChartLoadingState height={300} />);
    const loadingState = getByTestId('chart-loading-state');
    expect(loadingState.style.height).toBe('300px');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(<ChartLoadingState className="test-class" />);
    const loadingState = getByTestId('chart-loading-state');
    expect(loadingState.className).toContain('test-class');
  });
});
