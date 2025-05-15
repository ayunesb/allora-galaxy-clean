
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartLoadingState } from '@/components/admin/errors/charts';

describe('ChartLoadingState', () => {
  it('should render the loading spinner', () => {
    render(<ChartLoadingState />);
    
    const spinner = screen.getByTestId('chart-loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct height', () => {
    render(<ChartLoadingState />);
    
    const container = screen.getByTestId('chart-loading-container');
    expect(container).toHaveClass('h-64');
  });
});
