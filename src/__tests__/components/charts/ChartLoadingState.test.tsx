
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartLoadingState from '@/components/admin/errors/charts/ChartLoadingState';

describe('ChartLoadingState', () => {
  it('renders with default properties', () => {
    render(<ChartLoadingState />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<ChartLoadingState message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });
});
