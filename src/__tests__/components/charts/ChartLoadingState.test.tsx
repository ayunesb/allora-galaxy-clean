
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartLoadingState from '@/components/admin/errors/charts/ChartLoadingState';

describe('ChartLoadingState', () => {
  it('renders with default message', () => {
    render(<ChartLoadingState />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<ChartLoadingState message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('applies custom height', () => {
    const { container } = render(<ChartLoadingState height={200} />);
    const loadingDiv = container.firstChild;
    expect(loadingDiv).toHaveStyle('height: 200px');
  });
});
